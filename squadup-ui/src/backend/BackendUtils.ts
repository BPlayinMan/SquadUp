// @ts-expect-error For some reason it doesn't detect module definition, but runs just fine
import { v4 as uuid } from "uuid";

export interface RedirectInfo
{
    forceLogin: boolean;
    returnPath?: string;
}

export class FetchError extends Error
{
    private readonly _response: Response;

    constructor(response: Response, msg: string) {
        super(msg);

        this._response = response;

        //Dunno, dont care (https://stackoverflow.com/a/41429145)
        Object.setPrototypeOf(this, FetchError.prototype);
    }

    getResponse(): Response
    {
        return this._response;
    }
}

export function getAuthUrl(state?: string|undefined): string
{
    const search = new URLSearchParams();
    search.append("response_type", "code");
    search.append("client_id", process.env.OAUTH_CLIENT_ID);
    search.append("scope", process.env.OAUTH_SCOPE);

    //Append state if present
    if(state != undefined)
        search.append("state", state);

    search.append("redirect_uri", process.env.OAUTH_REDIRECT_URI);
    search.append("prompt", "consent");
    search.append("integration_type", "0");

    return process.env.OAUTH_BASE_URI + "?" + search.toString();
}

export function fetchBackend(path: string, init?: RequestInit, redirect?: RedirectInfo): Promise<Response | undefined>
{
    //Prepare init and headers
    if(init == undefined)
        init = {};
    if(init.headers == undefined)
        init.headers = {};
    
    //Get the authentication token from local storage
    const authToken = localStorage.getItem("authToken") ?? "";
    
    //Set authorization on headers and replace init headers
    const newHeaders = new Headers(init.headers);
    newHeaders.set("Authorization", "Bearer " + authToken);
    init.headers = newHeaders;
    console.log(process.env.API_URL + path);
    //Attempt to fetch requested path
    return fetch(process.env.API_URL + path, init)
        .then(resp =>
        {
            if(resp.status === 401)
                throw new FetchError(resp, "Failed to fetch: " + resp.statusText);
            
            return resp;
        })
        .catch(error =>
        {
            if(error instanceof FetchError)
            {
                //Get response from error
                const resp = error.getResponse();
                console.log(error);
                console.log(redirect);
                if(resp.status === 401 && redirect?.forceLogin)
                {

                    //Set auth redirect path
                    sessionStorage.setItem("authReturn", redirect.returnPath ?? "/app/user/@me");
                    
                    //Generate state for OAuth2 validation
                    const state = uuid();
                    sessionStorage.setItem("authState", state);
                    
                    //Redirect to login
                    window.location.assign(getAuthUrl(state));
                }
                
                return resp;
            }
            
            console.error("Fatal error while fetching backend");
            console.error(error);
            
            return undefined;
        });
}
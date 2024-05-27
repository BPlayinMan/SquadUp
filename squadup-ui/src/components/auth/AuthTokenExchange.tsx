import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";

export interface AuthUserInfo
{
    authenticated: boolean;
    jwt: string;
    username: string;
}

export default function AuthTokenExchange()
{
    //Use search params to get auth code
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [queryParams, _] = useSearchParams();
    let authCode = queryParams.get("code");

    //Use state for user information
    const [userInfo, setUserInfo] = useState<AuthUserInfo>({
        authenticated: false,
        jwt: "",
        username: ""
    });

    //Query API for authentication
    useEffect(() =>
    {
        //Prevent fetch if authenticated
        if(userInfo.authenticated)
            return;

        const opts: RequestInit = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({code: authCode})
        }
        fetch(process.env.API_URL + "/auth/exchange", opts)
            .then(resp =>
            {
                if(resp.status == 200)
                    return resp.json();
                else
                    throw new Error("Failed to authenticate: " + resp.status);
            })
            .then(authInfo =>
            {
                console.log("Got user " + authInfo.username);

                //Save JWT token in local storage and update user info
                localStorage.setItem("authToken", authInfo.auth);
                setUserInfo({
                    authenticated: true,
                    jwt: authInfo.token,
                    username: authInfo.username
                });

                const redirect = sessionStorage.getItem("authReturn")
                    ?? "/app/user/@me";
                console.log("Auth complete, redirecting to " + redirect);
                window.location.assign(redirect);
            })
            .catch(error =>
            {
                //TODO Proper handling
                console.log(error);
            });
    });

    return (
        <>
            <h1>{
                userInfo.authenticated
                    ? "Welcome " + userInfo.username
                    : "Authenticating..."
            }</h1>
        </>
    );
}
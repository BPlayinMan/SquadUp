import {createContext, useContext, useState} from "react";
import {AccountContext, UserInfo} from "@/components/auth/AccountProvider.tsx";
import {fetchBackend} from "@/backend/BackendUtils.ts";

interface UserCache {
    [Id: string]: UserInfo;
}

type UserCacheContextType = {
    cache: UserCache
    getUser(id: string): Promise<UserInfo|null>
}

const initialValue: UserCacheContextType = {
    cache: {},
    getUser(id: string): Promise<UserInfo | null> {
        return new Promise<UserInfo|null>(() => null);
    }
}

const UserCacheContext = createContext(initialValue);

export default function UserCacheProvider({...props})
{
    const accountCtx = useContext(AccountContext);

    const initialCache: UserCache = {};
    if(accountCtx.user.id !== undefined)
        initialCache[accountCtx.user.id as string] = accountCtx.user;

    const [cache, setCache] = useState<UserCache>(initialCache);

    const value = {
        cache: cache,
        getUser(id: string): Promise<UserInfo | null> {
            if(cache[id] !== undefined)
                return new Promise(() => cache[id]);

            //Return result of fetch
            return fetchBackend("/user/" + id, {method: "GET"})
                .then(resp => resp?.ok ? resp.json() : null)
                .then(data =>
                {
                    //console.log(cache[id]);
                    //Return null if no data
                    if(data === null)
                        return null;

                    const info = ({
                        ready: true,
                        id: data.id,
                        username: data.name,
                        avatar: data.avatar,
                        bio: data.bio
                    } as UserInfo);
                    console.log("Cached user " + id);
                    //console.log(info);

                    setCache(prev =>
                    {
                        prev[id] = info;
                        return prev;
                    });

                    //Return user info
                    return info;
                });
        }
    };

    return (
        <UserCacheContext.Provider value={value}>
            {props.children}
        </UserCacheContext.Provider>
    )
}

export function useUserCache()
{
    const ctx = useContext(UserCacheContext);
    if(ctx === undefined)
        throw new Error("useUserCache must be called within a cache provider");

    return ctx;
}
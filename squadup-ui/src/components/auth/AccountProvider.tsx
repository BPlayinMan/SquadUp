import {createContext, useEffect, useState} from "react";
import {fetchBackend} from "@/backend/BackendUtils.ts";

export interface UserInfo
{
    ready: boolean;
    id?: string|undefined;
    username?: string|undefined;
    avatar?: string|undefined;
    bio?: string|undefined;
}

export type AccountContextType =
{
    user: UserInfo
    logout: () => void
}

const defaultState = {
    user: {ready: false},
    logout: () => null
};

export const AccountContext = createContext<AccountContextType>(defaultState);

export function AccountProvider(props)
{
    //State of user login
    const [userInfo, setUserInfo] = useState<UserInfo>({ready: false});
    const value = {
        user: userInfo,
        logout: () =>
        {
            localStorage.removeItem("authToken");
            window.location.assign("/");
        }
    };

    //Attempt to load user info upon load
    useEffect(() =>
    {
        //Prevent additional fetches if data is ready
        if(userInfo.ready)
            return;

        fetchBackend("/user", {method: "GET"}, {forceLogin: props.forceLogin, returnPath: props.returnPath})
            .then(resp => resp?.json())
            .then(data =>
            {
                console.log("Fetched user data: " + data.name);
                setUserInfo({
                    ready: true,
                    id: data.id,
                    username: data.name,
                    avatar: data.avatar,
                    bio: data.bio
                });
            });
    });

    return (
        <AccountContext.Provider value={value}>
            {props.children}
        </AccountContext.Provider>
    );
}
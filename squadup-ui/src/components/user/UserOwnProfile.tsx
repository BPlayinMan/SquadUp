import {useContext} from "react";
import {AccountContext} from "../auth/AccountProvider.tsx";

export default function UserOwnProfile()
{
    const accountCtx = useContext(AccountContext);
    console.log(accountCtx);
    return (
        <>
            <h1>Welcome {accountCtx.user.username}</h1>
            <img src={accountCtx.user.avatar} alt={accountCtx.user.id} />
        </>
    )
}
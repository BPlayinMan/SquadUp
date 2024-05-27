import {AccountProvider} from "./auth/AccountProvider.tsx";
import AppNavbar from "@/components/util/AppNavbar.tsx";
import Sidebar from "@/components/util/Sidebar.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Outlet} from "react-router-dom";
import UserCacheProvider from "@/components/user/UserCacheProvider.tsx";

export default function AppRoot(props)
{
    //TODO Also add account navbar
    return (
        <AccountProvider forceLogin={true} returnUrl={"/app"}>
            <UserCacheProvider>
                <AppNavbar />
                <Separator />
                <div className={"flex w-full app-content max-h-screen"}>
                    <div className={"w-1/6 flex"}>
                        <Sidebar />
                        <Separator orientation={"vertical"} />
                    </div>
                    <div className={"w-5/6 max-h-screen"} style={{
                        padding: 5
                    }}>
                        <Outlet />
                    </div>
                </div>
            </UserCacheProvider>
        </AccountProvider>
    );
}
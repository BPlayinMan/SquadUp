import {createBrowserRouter} from "react-router-dom";
import AuthTokenExchange from "./components/auth/AuthTokenExchange.tsx";
import RootComponent from "./components/RootComponent.tsx";
import UserOwnProfile from "./components/user/UserOwnProfile.tsx";
import AppRoot from "./components/AppRoot.tsx";
import AppHomepage from "@/components/AppHomepage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootComponent />,
        children: [
            {
                path: "/auth/exchange",
                element: <AuthTokenExchange />
            },
            {
                path: "/app",
                element: <AppRoot />,
                children: [
                    {
                        index: true,
                        element: <AppHomepage />
                    },
                    {
                        path: "user/@me",
                        element: <UserOwnProfile />
                    }
                ]
            }
        ]
    }
]);
export default router;
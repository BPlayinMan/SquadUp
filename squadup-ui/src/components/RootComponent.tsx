import {Outlet} from "react-router-dom";
import {ThemeProvider} from "@/components/util/ThemeProvider.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import ThemeSelector from "@/components/util/ThemeSelector.tsx";

export default function RootComponent()
{
    return (
        <ThemeProvider>
            <Toaster />
            <ThemeSelector />
            <Outlet />
        </ThemeProvider>
    );
}
import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {SunMoon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import "@/style/theme.css";
import {Theme, useTheme} from "@/components/util/ThemeProvider.tsx";

export default function ThemeSelector()
{
    const theme = useTheme();

    function getCheckedCallback(forTheme: Theme)
    {
        return (checked: boolean) =>
        {
            if(checked)
                theme.setTheme(forTheme);
        };
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild style={{
                margin: 10
            }}>
                <Button variant={"outline"} size={"icon"}
                        className={"absolute bottom-0 left-0 rounded-full z-40"}
                >
                    <SunMoon size={30} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                    checked={theme.theme === "dark"}
                    onCheckedChange={getCheckedCallback("dark")}
                >
                    Dark
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={theme.theme === "light"}
                    onCheckedChange={getCheckedCallback("light")}
                >
                    Light
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={theme.theme === "system"}
                    onCheckedChange={getCheckedCallback("system")}
                >
                    System
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
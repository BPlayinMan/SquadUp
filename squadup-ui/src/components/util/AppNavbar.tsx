import {Link} from "react-router-dom";
import React, {useContext} from "react";
import {AccountContext} from "@/components/auth/AccountProvider.tsx";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu.tsx";
import {Bell, Home, LogOut, Plus, Settings} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import "@/style/navbar.css";
import {Button} from "@/components/ui/button.tsx";
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog.tsx";
import CreatePostDialog from "@/components/post/create/CreatePostDialog.tsx";
import NotificationMenu from "@/components/notifications/NotificationMenu.tsx";

export default function AppNavbar()
{
    const accountCtx = useContext(AccountContext);

    return (
        <NavigationMenu className={"w-full max-w-full h-[45px] app-header"} id={"main-nav"} style={{
            padding: 5
        }}>
            <NavigationMenuList className={"w-full max-w-full flex-row"}>
                <div className={"grow-0 shrink flex"}>
                    <NavigationMenuItem>
                        <Link to={"/app/user/@me"} className={navigationMenuTriggerStyle()}>
                            <img
                                src={accountCtx.user.avatar}
                                alt={accountCtx.user.id}
                                className={"size-7 rounded-full"}
                                style={{
                                    marginRight: 7
                                }}
                            />
                            {accountCtx.user.username}
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            <Bell size={20} />
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className={"w-[400px]"}>
                            <NotificationMenu />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant={"secondary"}>
                                    <Plus size={20} style={{
                                        marginRight: 7
                                    }}/>
                                    Create
                                </Button>
                            </DialogTrigger>
                            <CreatePostDialog />
                        </Dialog>
                    </NavigationMenuItem>
                </div>
                <div className={"grow shrink-0"}>
                    {/* Empty for space fill */}
                </div>
                <div className={"grow-0 shrink flex"}>
                    <NavigationMenuItem>
                        <Button variant={"secondary"}>
                            <Settings size={20} style={{
                                marginRight: 7
                            }}/>
                            Settings
                        </Button>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Button variant={"secondary"} onClick={accountCtx.logout}>
                            <LogOut size={20} style={{
                                marginRight: 7
                            }} />
                            Log out
                        </Button>
                    </NavigationMenuItem>
                </div>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
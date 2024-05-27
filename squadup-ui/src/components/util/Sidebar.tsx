import {Link, LinkProps, NavLink} from "react-router-dom";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import React, {useEffect, useRef} from "react";
import {BookUser, Home, TrendingUp, X} from "lucide-react";

import "@/style/sidebar.css";
import {Separator} from "@/components/ui/separator.tsx";

function SidebarLink(props: LinkProps)
{
    const linkRef = useRef<HTMLAnchorElement>();

    useEffect(() =>
    {
        linkRef.current?.classList.remove("justify-center");
    })

    return (
        <Link to={props.to}
              className={buttonVariants({variant: "ghost"}) + " w-full justify-start sidebar-link"}
              style={{
                  marginBottom: 5
              }}
              ref={linkRef}
        >
            {props.children}
        </Link>
    );
}

export default function Sidebar()
{
    return (
        <div>
            <div style={{
                padding: 5
            }}>
                <SidebarLink to={"/app"}>
                    <Home/>
                    Home
                </SidebarLink>
                <SidebarLink to={"/app?filter=popular"}>
                    <TrendingUp/>
                    Popular
                </SidebarLink>
                <SidebarLink to={"/app?filter=friends"}>
                    <BookUser/>
                    Friends
                </SidebarLink>
            </div>
            <Separator />
            <div style={{
                padding: 5
            }}>
                <div className={"flex justify-between"}>
                    <h4 className={"scroll-m-20 text-xl font-semibold tracking-tight"}
                        style={{
                            paddingLeft: 10,
                            textAlign: "center",
                            verticalAlign: "baseline"
                        }}
                    >
                        Filters
                    </h4>
                    <Button variant={"outline"} className={"flex"}>
                        <X size={20} style={{
                            marginRight: 5
                        }}/>
                        Clear
                    </Button>
                </div>
            </div>
        </div>
    );
}
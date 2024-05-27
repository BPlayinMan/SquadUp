import React, {ChangeEvent, ChangeEventHandler, MutableRefObject, useEffect, useState} from "react";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {PostFlag} from "@/components/post/PostFlag.tsx";
import {DropdownMenuCheckboxItemProps} from "@radix-ui/react-dropdown-menu";

export type PostFlagRefType = {
    flags: Array<number>
}

export type PostFlagInfo = {
    id: number
    name: string
    desc: string
}

type PostFlagFetchInfo = {
    ready: boolean
    flags?: Array<PostFlagInfo>
}

function getFilteredFlags(flags: Array<PostFlagInfo>, filter: string): Array<PostFlagInfo>
{
    if(flags === undefined)
        return [];

    return flags.filter((val, idx, arr) => filter === undefined || val.name.startsWith(filter));
}

export const PostFlagSelector =
    React.forwardRef((props, ref) =>
{
    const [flags, setFlags] = useState<PostFlagFetchInfo>({ready: false});
    const [selectedFlags, setSelectedFlags] = useState<Array<number>>([]);
    const [filter, setFilter] = useState<string>("");

    ref.current.flags = selectedFlags;

    //Fetch flag information upon startup
    useEffect(() =>
    {
        //Fetch only if not ready
        if(!flags.ready)
        {
            fetchBackend("/data/flags", {method: "GET"})
                .then(resp =>
                {
                    //TODO Show toast popup
                    if(resp?.status !== 200)
                        console.log(resp);

                    return resp?.json();
                })
                .then(data =>
                {
                    //Update retrieved flags
                    setFlags({
                        ready: true,
                        flags: data
                    });
                });
        }
    });

    function updateFilter(evt: ChangeEvent<HTMLInputElement>)
    {
        setFilter(evt.currentTarget.value);
    }

    type Checked = DropdownMenuCheckboxItemProps["checked"];

    function getFlagChecked(flag: PostFlagInfo): Checked
    {
        return (selectedFlags.find(
                (val, idx, arr) => val === flag.id
            ) != undefined
        );
    }

    function getUpdateFlagCheckedCallback(flag: PostFlagInfo): (checked: boolean) => void
    {
        return (
            (checked: boolean) =>
            {
                if(checked)
                {
                    setSelectedFlags(prev => [...prev, flag.id]);
                } else
                {
                    setSelectedFlags(prev => prev.filter(item => item != flag.id));
                }
            }
        );
    }

    function handleDeleteFlag(id: number, name: string): void
    {
        setSelectedFlags(prev => prev.filter(item => item != id));
    }

    return (
        <div>
            <div style={{
                paddingBottom: 5
            }}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"}>
                            <Plus size={16} style={{
                                marginRight: 5
                            }} />
                            Add
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <Input type={"text"} placeholder={"Search flags"} onChange={updateFilter}/>
                        {
                            getFilteredFlags(flags.flags as Array<PostFlagInfo>, filter).map((value, idx, arr) => (
                                <TooltipProvider key={idx}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DropdownMenuCheckboxItem
                                                checked={getFlagChecked(value)}
                                                onCheckedChange={getUpdateFlagCheckedCallback(value)}
                                            >
                                                {value.name}
                                            </DropdownMenuCheckboxItem>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{value.desc}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className={"flex"}>
                {
                    flags.ready &&
                    selectedFlags.map((item, idx) => {
                        const flag = (flags.flags as Array<PostFlagInfo>)[item - 1]
                        return (
                            <PostFlag
                                id={flag.id} name={flag.name} description={flag.desc}
                                key={flag.id}
                                editable onDelete={handleDeleteFlag}
                                style={{
                                    marginLeft: 5
                                }}
                            />
                        );
                    })
                }
            </div>
        </div>
    );
})
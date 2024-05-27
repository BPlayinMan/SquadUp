import {X} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CSSProperties} from "react";

type PostFlagProps = {
    id: number
    name: string
    description: string
    editable?: boolean
    onDelete?: (id: number, name: string) => void
    style?: CSSProperties
};

function emptyDeleteHandler(id, name) {}

export function PostFlag({id, name, description, editable = false, onDelete = emptyDeleteHandler, style = {}, ...props}: PostFlagProps)
{
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={"flex border border-input rounded-md w-fit"} style={{
                        paddingLeft: 5,
                        ...style
                    }}>
                        <p className={"text-sm"}
                           style={{
                               paddingRight: 5
                           }}>
                            {name}
                        </p>
                        {
                            editable &&
                            <button onClick={() => onDelete(id, name)} style={{
                                paddingRight: 5
                            }}>
                                <X size={16}/>
                            </button>
                        }
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
import {DialogClose, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import PostActivitySelector from "@/components/post/create/PostActivitySelector.tsx";
import {createRef, MouseEvent, useRef, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {PostFlagSelector} from "@/components/post/create/PostFlagsSelector.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {PostDetailsSelector} from "@/components/post/create/PostDetailsSelector.tsx";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {ToastAction} from "@/components/ui/toast.tsx";


export default function CreatePostDialog()
{
    //Utility state to handle closing the dialogue after posting
    //const [posted, setPosted] = useState(false);
    let posted = false;

    const activityRef = useRef({
        info: undefined
    });
    const flagsRef = useRef({
        flags: []
    });
    const detailsRef = useRef({
        details: "",
        lang: ""
    });

    function handleViewPost(id: number)
    {
        return (evt) => { window.location.assign("/app/post?id=" + id); }
    }

    function handlePost(evt: MouseEvent<HTMLButtonElement>)
    {
        //Immediately quit handle if posting already
        if(posted)
            return;

        console.log(activityRef.current.info);
        console.log(flagsRef.current.flags);
        console.log(detailsRef.current.details);
        console.log(detailsRef.current.lang);

        const reqBody = JSON.stringify({
            "activity": activityRef.current?.info?.activityId,
            "activityDetails": activityRef.current?.info?.activityDetails,
            "postDetails": detailsRef.current.details,
            "lang": detailsRef.current.lang,
            "flags": flagsRef.current.flags
        });
        console.log(reqBody);

        const target = evt.currentTarget;
        evt.preventDefault();

        fetchBackend("/post/create", {method: "POST", body: reqBody})
            .then(resp =>
            {
                if(resp?.status !== 200)
                    console.log(resp);

                return resp?.json();
            })
            .then(data =>
            {
                console.log(data?.id);
                posted = true;

                //Simulate click to close the dialog
                target.click();
                toast({
                    title: "Post created",
                    description: "Your LFG has been posted",
                    action: (
                        <ToastAction altText={"Goto post"} onClick={handleViewPost(data?.id)}>View</ToastAction>
                    )
                });
            });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a post</DialogTitle>
            </DialogHeader>
            <p className={"text-l"}>Activity</p>
            <PostActivitySelector ref={activityRef} />
            <Separator />
            <PostFlagSelector ref={flagsRef} />
            <Separator />
            <PostDetailsSelector ref={detailsRef} />
            <DialogClose asChild>
                <Button type={"button"} onClick={handlePost}>Post</Button>
            </DialogClose>
        </DialogContent>
    )
}
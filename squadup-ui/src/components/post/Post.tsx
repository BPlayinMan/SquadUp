import {PostFlagInfo} from "@/components/post/create/PostFlagsSelector.tsx";
import {ButtonHTMLAttributes, useContext, useEffect, useState} from "react";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {PostFlag} from "@/components/post/PostFlag.tsx";
import {Button} from "@/components/ui/button.tsx";
import UserProfileCard from "@/components/user/UserProfileCard.tsx";
import {Archive, Check, Loader, Play, Trash2, Users, X} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {AccountContext} from "@/components/auth/AccountProvider.tsx";
import {toast} from "@/components/ui/use-toast.ts";

export type PostActivityInfo = {
    id: number
    gameId: number
    gameName: string
    desc: string
    type: string
    details?: string
    maxPlayers: number
}

type Interest = "None" | "Maybe" | "Accept";

export type PostInterestInfo = {
    maybe: number
    accept: number
    own: Interest
}

export type PostInfo = {
    id: number
    owner: string
    activity: PostActivityInfo
    details?: string
    lang: string
    open: boolean
    creationDate: string
    flags: Array<PostFlagInfo>
    interests: PostInterestInfo
}

type PostWrapperProps = {
    postId: number
}

type PostProps = {
    post: PostInfo
}

type InterestButtonProps = {
    interestType: Interest
}

export function Post({post}: PostProps)
{
    const account = useContext(AccountContext);

    const [interest, setInterest] = useState<Interest|null>(post.interests.own);
    const interestDesc = {
        None: "No interest",
        Maybe: "May take part",
        Accept: "Hell yeah"
    };

    function getDeclareInterestCallback(forInterest: Interest): () => void
    {
        return () =>
        {
            //Prevent execution if already set
            if(interest === forInterest)
                return;

            //Cache previous interest
            const oldInterest = interest;

            setInterest(forInterest);
            fetchBackend("/post/interest", {method: "POST", body: JSON.stringify({
                    postId: post.id,
                    interest: forInterest
                })})
                .then(resp =>
                {
                    //TODO Show toast
                    if(!resp?.ok)
                        console.log(resp);

                    return resp?.json();
                })
                .then(data =>
                {
                    if(data.result === "error")
                    {
                        toast({
                            title: "Error while updating interest",
                            description: <p>{data.error}</p>
                        });

                        //Reset to old interest
                        setInterest(oldInterest);
                    } else
                    {
                        toast({
                            title: "Updated interest",
                            description: <p>Updated interest for post</p>
                        });
                        setInterest(data.interest);
                    }
                });
        }
    }

    function InterestButton({interestType, ...props}: InterestButtonProps & ButtonHTMLAttributes<HTMLButtonElement>)
    {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={interest === interestType ? "default" : "outline"} size={"icon"}
                                onClick={getDeclareInterestCallback(interestType)}
                                style={{
                                    marginRight: 7
                                }}
                                {...props}>
                            {props.children}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {interestDesc[interestType]}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    function handlePostDelete()
    {
        fetchBackend("/post/delete/" + post.id, {method: "POST"})
            .then(resp =>
            {
                if(resp === undefined)
                    toast({
                        title: "Failed to delete post",
                        description: "Unknown error",
                        variant: "destructive"
                    });
                else if(!resp.ok)
                    toast({
                        title: "Failed to delete post: " + resp.status,
                        description: resp.statusText,
                        variant: "destructive"
                    });
                else
                {
                    //For now just reload page
                    console.log("Deleted post " + post.id);
                    window.location.reload();
                }
            });
    }

    function handlePostStart()
    {
        fetchBackend("/post/start/" + post.id, {method: "POST"})
            .then(resp =>
            {
                if(resp === undefined || !resp.ok)
                {
                    toast({
                        title: "Failed to start post",
                        description: resp === undefined ? "Unknown error" : resp.statusText,
                        variant: "destructive"
                    });
                } else
                {
                    toast({
                        title: "Activity started",
                        description: <p>Started <b>{post.activity.type} - {post.activity.gameName}</b></p>
                    });
                }
            });
    }

    return (
        <Card className={"w-2/3"} style={{
            marginBottom: 7
        }}>
            <div className={"flex"}>
                <CardHeader className={"grow"}>
                    <CardTitle>{post.activity.desc} - {post.activity.gameName}</CardTitle>
                    <CardDescription>{post.activity.details}</CardDescription>
                </CardHeader>
                {
                    //Add post state edit if owner is current user
                    post.owner == account.user.id &&
                    <div style={{
                        padding: 24
                    }}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={"ghost"} size={"icon"} style={{
                                        marginRight: 7
                                    }}
                                            onClick={handlePostStart}
                                    >
                                        <Play />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Start activity
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={"destructive"} size={"icon"} onClick={handlePostDelete}>
                                        <Trash2 />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Delete
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                }
            </div>

            <CardContent>
                <p>{post.details}</p>
                <div className={"flex"}
                     style={{
                         marginTop: 7
                     }}
                >
                    {
                        post.flags.map(flag => (
                            <PostFlag id={flag.id}
                                      name={flag.name} description={flag.desc}
                                      editable={false}
                                      key={flag.id}
                                      style={{
                                          marginRight: 5
                                      }}
                            />
                        ))
                    }
                </div>
            </CardContent>
            <CardFooter className={"justify-between"}>
                <UserProfileCard userId={post.owner} navigateOnClick />
                <div className={"flex"}>
                    <div className={"flex items-center"}
                         style={{
                             marginRight: 15
                         }}
                    >
                        <Users style={{
                            marginRight: 5
                        }} />
                        <p>{post.interests.accept} / {post.activity.maxPlayers}</p>
                    </div>
                    <div className={"flex"}>
                        <InterestButton interestType={"None"} disabled={post.owner == account.user.id}>
                            <X />
                        </InterestButton>
                        <InterestButton interestType={"Maybe"} disabled={post.owner == account.user.id}>
                            <Loader />
                        </InterestButton>
                        <InterestButton interestType={"Accept"}>
                            <Check />
                        </InterestButton>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export function PostWrapper({postId}: PostWrapperProps)
{
    const [post, setPost] = useState<PostInfo|null>(null);

    useEffect(() =>
    {
        if(post !== null)
            return;

        fetchBackend("/post/" + postId, {method: "GET"})
            .then(resp => resp?.json())
            .then(data => data as PostInfo)
            .then(info =>
            {
                console.log(info);
                setPost(info);
            });
    }, [post, postId]);

    return (
        <>
            {
                post !== null
                    ? <Post post={post} />
                    : <p>Loading post {postId}</p>
            }
        </>
    );
}
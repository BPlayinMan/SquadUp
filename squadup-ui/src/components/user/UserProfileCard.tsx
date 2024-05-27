import {useEffect, useState} from "react";
import {UserInfo} from "@/components/auth/AccountProvider.tsx";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {useUserCache} from "@/components/user/UserCacheProvider.tsx";

type UserProfileCardProps = {
    userId: string
    navigateOnClick: boolean
}

export default function UserProfileCard({userId, navigateOnClick = false, ...props}: UserProfileCardProps)
{
    const userCache = useUserCache();
    const [user, setUser] = useState<UserInfo>({ready: false});

    useEffect(() =>
    {
        //Prevent exec if user already fetched
        if(!user.ready)
        {
            userCache.getUser(userId)
                .then(info =>
                {
                    if(info === null)
                        info = {ready: true};

                    setUser(info);
                })
        }
    }, [userCache, user, userId]);

    function handleProfileCardClick()
    {
        if(navigateOnClick)
        {
            window.location.assign("/app/user/" + user.id);
        }
    }

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button variant={"link"} onClick={handleProfileCardClick}>
                    {
                        user === null
                            ? "Loading..."
                            : "@" + user.username
                    }
                </Button>
            </HoverCardTrigger>
            <HoverCardContent className={"flex"}>
                {
                    user === null
                        ? "Loading..."
                        :
                        <>
                            <Avatar>
                                <AvatarImage src={user.avatar} alt={"@" + user.username} />
                                <AvatarFallback>{user.id}</AvatarFallback>
                            </Avatar>
                            <div style={{
                                marginLeft: 10
                            }}>
                                <p className={"scroll-m-20 text-l font-semibold tracking-tight"}>@{user.username}</p>
                                <p className={"text-sm text-muted-foreground"}>
                                    {user.bio ?? <i>No bio set</i>}
                                </p>
                            </div>
                        </>
                }
            </HoverCardContent>
        </HoverCard>
    )
}
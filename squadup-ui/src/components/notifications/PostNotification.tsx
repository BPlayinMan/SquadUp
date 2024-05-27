import {PostActivityInfo} from "@/components/post/Post.tsx";
import UserProfileCard from "@/components/user/UserProfileCard.tsx";
import {Button} from "@/components/ui/button.tsx";

type PostNotificationInfo = {
    post: number
    activity: PostActivityInfo
    user: string
}

export default function PostNotification({post, activity, user, ...props}: PostNotificationInfo)
{
    return (
        <div className={"flex-col w-full"}
             style={{
                 margin: 5
            }}
        >
            <p className={"flex"}>Post by <UserProfileCard userId={user} navigateOnClick /></p>
            <div className={"flex-col"}>
                <p>{activity.gameName} - {activity.type}</p>
                <p>{activity.details}</p>
            </div>
        </div>
    );
}
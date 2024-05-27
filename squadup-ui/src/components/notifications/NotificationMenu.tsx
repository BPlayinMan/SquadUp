import {useEffect, useState} from "react";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import SystemNotification from "@/components/notifications/SystemNotification.tsx";
import PostNotification from "@/components/notifications/PostNotification.tsx";

type NotificationScope = "System" | "Post";

type NotificationInfo = {
    id: number
    target: string
    sender?: string
    scope: NotificationScope
    content: any
}

const notificationScopeMap = {
    System: SystemNotification,
    Post: PostNotification
}

export default function NotificationMenu()
{
    const [notifications, setNotifications] = useState<Array<NotificationInfo>|null>(null);

    useEffect(() =>
    {
        if(notifications === null)
        {
            fetchBackend("/notifications", {method: "GET"})
                .then(resp =>
                {
                    if(resp === undefined || !resp.ok)
                        setNotifications([]);

                    return resp?.json();
                })
                .then(data => data as Array<NotificationInfo>)
                .then(nots =>
                {
                    if(notifications === null)
                    {
                        console.log(nots);
                        setNotifications(nots);
                    }
                });
        }
    }, [notifications]);

    return (
        <div className={"w-[400px]"}>
            {
                notifications != null && notifications.length != 0
                    ? notifications.map(n => notificationScopeMap[n.scope]({key: n.id, ...n.content}))
                    : <p>No notifications available</p>
            }
        </div>
    );
}
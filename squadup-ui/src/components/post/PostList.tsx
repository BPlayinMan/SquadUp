import {useEffect, useState} from "react";
import {Post, PostInfo} from "@/components/post/Post.tsx";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

type PostListFilter = {
    gameId?: number
    actType?: number
}

type PostListProps = {
    filter?: PostListFilter
}

export default function PostList({filter = null, ...props}: PostListProps)
{
    const [posts, setPosts] = useState<Array<PostInfo>|null>(null);

    useEffect(() => {
        if(posts === null)
        {
            fetchBackend("/post", {method: "GET"})
                .then(resp =>
                {
                    console.log(resp);
                    if(!resp?.ok)
                        setPosts([]);

                    return resp?.json();
                })
                .then(data => data as Array<PostInfo>)
                .then(info =>
                {
                    //Update posts only if null
                    if(posts === null)
                    {
                        console.log(info);
                        setPosts(info);
                    }
                });
        }
    }, [posts]);

    console.log(posts);

    return posts === null
        ? <p>Loading posts</p>
        :
        <>
            <ScrollArea className={"max-h-screen h-screen"}>
                {
                    posts.map(info => (
                        <Post post={info} key={info.id} />
                    ))
                }
            </ScrollArea>
        </>
}

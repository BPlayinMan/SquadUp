import {
    ChangeEvent,
    forwardRef,
    useEffect,
    useState
} from "react";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";

export type PostActivityInfo = {
    gameId?: number
    activityId?: number
    activityDetails?: string
}

type GameInformation = {
    id: number
    name: string
    desc: string
    web: string
};

type GameInfoFetchResult = {
    ready: boolean
    games?: Array<GameInformation>
};

type ActivityInformation = {
    id: number
    name: string
    desc: string
    max: number
}

type ActivityInfoFetchResult = {
    ready: boolean
    activities?: Array<ActivityInformation>
}

function PostActivitySelector(props, ref)
{
    //States for games and activities
    const [games, setGames] = useState<GameInfoFetchResult>({ready: false});
    const [activities, setActivities] = useState<ActivityInfoFetchResult>({ready: false});

    const [info, setInfo] = useState<PostActivityInfo>({});
    ref.current.info = info;

    useEffect(() =>
    {
        if(!games.ready)
        {
            fetchBackend("/data/game", {method: "GET"})
                .then(resp =>
                {
                    //TODO Show toast popup
                    if(resp?.status !== 200)
                        console.log(resp);

                    return resp?.json();
                })
                .then(data =>
                {
                    //Update available games
                    setGames({
                        ready: true,
                        games: data as Array<GameInformation>
                    });
                });
        }
    });

    function onSelectedGameChange(evt: string)
    {
        const gameId = parseInt(evt);

        //Set activities not ready
        setActivities({ready: false});

        //Update selected info
        setInfo((prev) =>
        {
            prev.gameId = gameId;
            return prev;
        });

        fetchBackend("/data/activity/" + evt, {method: "GET"})
            .then(resp =>
            {
                //TODO Show toast popup
                if(resp?.status !== 200)
                    console.log(resp);

                return resp?.json();
            })
            .then(data =>
            {
                //Update activities
                setActivities({
                    ready: true,
                    activities: data as Array<ActivityInformation>
                });
            });
    }

    function onSelectedActivityChange(evt: string)
    {
        setInfo(prev =>
        {
            prev.activityId = parseInt(evt);
            return prev;
        });
    }

    function onDetailsChange(evt: ChangeEvent<HTMLInputElement>)
    {
        setInfo(prev =>
        {
            prev.activityDetails = evt.currentTarget.value;
            return prev;
        });
    }

    return (
        <div>
            <div className={"flex justify-between"} style={{
                paddingBottom: 10
            }}>
                <Select disabled={!games.ready} onValueChange={onSelectedGameChange}>
                    <SelectTrigger style={{
                        marginRight: 10
                    }}>
                        <SelectValue placeholder={"Select a game"}/>
                    </SelectTrigger>
                    <SelectContent>
                        {
                            games.games?.map((game, idx) => (
                                <SelectItem value={game.id.toString()} key={game.id}>{game.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <Select disabled={!activities.ready} onValueChange={onSelectedActivityChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={"Select an activity"}/>
                    </SelectTrigger>
                    <SelectContent>
                        {
                            activities.activities?.map((act, idx) => (
                                <SelectItem value={act.id.toString()} key={act.id}>{act.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>
            <Input type={"text"} placeholder={"Activity details"} onChange={onDetailsChange}/>
        </div>
    );
}

export default forwardRef(PostActivitySelector);
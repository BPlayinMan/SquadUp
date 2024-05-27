import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {fetchBackend} from "@/backend/BackendUtils.ts";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Label} from "@/components/ui/label.tsx";

export type PostLanguageInfo = {
    code: string
    name: string
}

export type PostLanguageFetchInfo = {
    ready: boolean
    langs?: Array<PostLanguageInfo>
}

export const PostDetailsSelector =
    React.forwardRef((props, ref) =>
    {
        const [languages, setLanguages] = useState<PostLanguageFetchInfo>({ready: false});

        useEffect(() =>
        {
            //Don't fetch backend services if languages are ready
            if(!languages.ready)
            {
                fetchBackend("/data/langs", {method: "GET"})
                    .then(resp =>
                    {
                        if(resp?.status !== 200)
                            console.log(resp);

                        return resp?.json();
                    })
                    .then(data =>
                    {
                        setLanguages({
                            ready: true,
                            langs: data as Array<PostLanguageInfo>
                        });
                    });
            }
        }, [languages]);

        function handleTextChange(evt: ChangeEvent<HTMLTextAreaElement>)
        {
            if(ref === null)
                return;

            ref.current.details = evt.currentTarget.value;
        }

        function handleLangChange(evt: string)
        {
            if(ref === null)
                return;

            ref.current.lang = evt;
        }

        return (
            <div>
                <Select onValueChange={handleLangChange}>
                    <SelectTrigger disabled={!languages.ready}>
                        <SelectValue placeholder={"Select language"} />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            languages.ready &&
                            languages.langs?.map((val) => (
                                <SelectItem key={val.code} value={val.code}>{val.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <Textarea
                    placeholder={"Post details"}
                    onChange={handleTextChange}
                    style={{
                        marginTop: 7
                    }}
                />
            </div>
        );
    });
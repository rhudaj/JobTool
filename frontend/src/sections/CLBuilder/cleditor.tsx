import { JSX, useEffect } from "react";
import ItemBucket from "../../components/dnd/Bucket";
import { useImmer } from "use-immer";
import { getBucketType, Item } from "../../components/dnd/types";

function CLEditor(props: {
    paragraphs: string[],
}) {

    const [pgs, setPgs] = useImmer<string[]>(null);

    useEffect(()=> {
        setPgs([
            "First Last",
            "City, State",
            "username@email.come",
            "",
            new Date().toDateString(),
            "Dear Hiring Manager",
            ...(props.paragraphs ? props.paragraphs : [])
        ]);
    }, [props.paragraphs]);

    const handleBucketUpdate = (newItems: Item<string>[]) => {
        setPgs(newItems.map((I:Item<string>)=>I.value));
    }

    return (
            <ItemBucket
                type="cl_paragraphs"
                id="cl-paragraphs"
                items={pgs?.map((p: string, i: number) => ({
                    id: `cl-paragraph-${i}`,
                    value: p
                }))}
            />
    );
}

export default CLEditor;
import './infoPad.css';
import { useEffect, useState } from "react";

import { Bucket, Item, BucketComponent } from '../../dnd/dnd';

let count = 0;

export function InfoPad(props: { cv_info: any} ) {

    const [cv_info, set_cv_info] = useState<Bucket[]>([]);

    useEffect(() => {
        console.log("CV info:", props.cv_info);
        const arr = Object.entries(props.cv_info).map((entry: [string, any[]]) => ({
            id: entry[0] as string,
            items: entry[1].map(val=>({
                id: count++,
                value: val
            }) as Item)
        }) as Bucket);
        console.log("CV info as array:", arr);
        set_cv_info(arr);
    }, [props]);


    function displayItem (props: {item: Item}) {
        return (
            <div key={props.item.id} className="item-display">
                {props.item.value}
            </div>
        );
    };

    function DisplayItems (props: {children: JSX.Element[]}) {
        return (
            <div className="items-display">
                {props.children}
            </div>
        );
    }

    return (
        <div id="info-pad">
            {
                cv_info.map((bucket, i) => (
                    <div key={bucket.id}>
                        <h3>{bucket.id}</h3>
                        <BucketComponent
                            key={i}
                            bucket={bucket}
                            isVertical={false}
                            DisplayItem={displayItem}
                            DisplayItems={DisplayItems}
                        />
                    </div>
                ))
            }
        </div>
    );
};
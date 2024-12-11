import './infoPad.scss';

import { useLogger } from '../../hooks/logger';
import { ExperienceUI } from '../CVEditor/v2/cveditor';
import { Bucket, BucketComponent, Item } from '../dnd/dnd';
import React from "react";

let count = 0; // TODO: internalize this state

export function InfoPad(props: { cv_info: any} ) {

    const log = useLogger("InfoPad");
    const [infoBuckets, setInfoBuckets] = React.useState<Bucket[]>([]);

    // Convert into Bucket[] format
    React.useEffect(() => {
        log("props.cv_info:", props.cv_info);
        setInfoBuckets(prev =>
            Object.entries(props.cv_info)
            .map((entry: [string, any[]]) => ({
                id: entry[0],
                items: entry[1].map(value => ({
                    id: count++,
                    value: value
                } as Item))
            } as Bucket))
    )}, [props.cv_info])

    function displayItem(props: {item: Item}) {
        return (
            <div className="info-pad-item">
                {props.item.value}
            </div>
        )
    }

    function DisplayItems(props: {children: JSX.Element[]}) {
        return (
            <div className="info-pad-items">
                {props.children}
            </div>
        )
    }

    // ----------------- RENDER -----------------

    if(infoBuckets.length === 0)
        return <div id="info-pad">no cv-info found</div>;
    else return (
        <div id="info-pad">
            {infoBuckets.map((bucket: Bucket, i: number) => (
                <div key={i}>
                    <h3>{bucket.id}</h3>
                    <BucketComponent
                        bucket={bucket}
                        isVertical={false}
                        DisplayItem={
                            bucket.id ===
                            "projects" ?
                            (props) => <ExperienceUI {...props.item.value} /> :
                            displayItem
                        }
                        DisplayItems={DisplayItems}
                        deleteItemsDisabled
                    />
                </div>
            ))}
        </div>
    );
};
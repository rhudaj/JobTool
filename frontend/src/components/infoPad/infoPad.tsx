import './infoPad.scss';

import { useLogger } from '../../hooks/logger';
import { BucketComponent } from '../dnd/dnd';
import React from "react";

import { BucketTypes, CVInfoPadMap } from '../dnd/types/types';

export function InfoPad(props: { cv_info: any} ) {

    const log = useLogger("InfoPad");

    // ----------------- STATE -----------------

    const [infoBuckets, setInfoBuckets] = React.useState([]);

    // Convert into [{id: string, values: any[]}]
    React.useEffect(() => {
        log("props.cv_info:", props.cv_info);
        setInfoBuckets(prev =>
            Object.entries(props.cv_info).map((entry: [string, any[]]) => ({
                id: entry[0],
                values: entry[1]
            }))
        )
    }, [props.cv_info]);

    // ----------------- RENDER -----------------

    const InfoPadComponents = infoBuckets.map((bucket, i: number) => {
        const bucketType = BucketTypes[CVInfoPadMap[bucket.id]];
        return (
            <div key={i}>
                <h3>{bucket.id}</h3>
                <BucketComponent
                    key={i}
                    id={bucket.id}
                    values={bucket.values}
                    isVertical={bucketType.isVertical}
                    DisplayItem={bucketType.DisplayItem}
                    DisplayItems={bucketType.DisplayItems}
                    deleteItemsDisabled
                />
            </div>
        );
    });

    // ----------------- RENDER -----------------

    if(infoBuckets.length === 0)
        return <div id="info-pad">no cv-info found</div>;
    else
        return <div id="info-pad">{InfoPadComponents}</div>;
};
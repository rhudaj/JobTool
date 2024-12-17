import './infoPad.scss';
import { useLogger } from '../../hooks/logger';
import { BucketComponent } from '../dnd/dnd';
import React from "react";
import { BucketTypes, InfoPadMap } from '../dnd/types';



export function InfoPad(props: { info: any} ) {

    const log = useLogger("InfoPad");

    // ----------------- STATE -----------------

    const [infoBuckets, setInfoBuckets] = React.useState([]);

    // Convert into [{id: string, values: any[]}]
    React.useEffect(() => {
        log("props.cv_info:", props.info);
        if (!props.info) return;
        setInfoBuckets(
            Object.entries(props.info).map(entry => ({
                id: entry[0],
                values: entry[1]
            }))
        )
    }, [props.info]);


    // ----------------- RENDER -----------------

    if (infoBuckets.length === 0) {
        log("No cv_info passed in props");
        return <div id="info-pad">no cv-info found</div>;
    }

    /** TODO: improve annoying dependency
     * As of now, when you add a new item to /public/cv_info.json or /public/cl_info.json
     * you also have to define a bucket type.
     * otherwise, BucketTypes[CVInfoPadMap[bucket.id]] will throw an error.
     */
    const InfoPadComponents = infoBuckets.map((bucket, i: number) => {
        const type_for_bucket = InfoPadMap[bucket.id];
        const bt = BucketTypes[type_for_bucket];
        return (
            <div key={i}>
                <h3>{bucket.id}</h3>
                <BucketComponent
                    key={i}
                    id={bucket.id}
                    values={bucket.values}
                    item_type={bt.item_type}
                    isVertical={bt.isVertical}
                    displayItemsClass={bt.displayItemsClass}
                    deleteItemsDisabled
                    disableItemReplace
                    disableDrop
                >
                    { bucket.values.map(bt.DisplayItem) }
                </BucketComponent>
            </div>
        );
    });

    // ----------------- RENDER -----------------

    if(infoBuckets.length === 0)
        return <div id="info-pad">no cv-info found</div>;
    else
        return <div id="info-pad">{InfoPadComponents}</div>;
};
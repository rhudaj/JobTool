import { Experience } from "shared";
import { ExperienceUI } from "../CVEditor/template2/cveditor2";
import "./types.scss";

const DEFAULT_ITEM_TYPE = "DRAG-ITEM";

interface Item {
    id: any;
    value: any;		// can't be a JSX element. Anything else is fine.
};

interface Bucket {
    id: any;
    items: Item[];
};

interface BucketType {
    item_type: string,
    isVertical: boolean,
    DisplayItem?: (props: any) => JSX.Element,
    displayItemsClass?: string
};

const BucketTypes: { [key: string]: BucketType } = {
    "info-pad-text-list": {
        item_type: "text",
        isVertical: false,
        displayItemsClass: "text-item-list",
        DisplayItem: (props: string) => <div className="text-item" key={props}>{props}</div>
    },
    "experiences": {
        item_type: "experience",
        isVertical: true,
        displayItemsClass:"experiences",
        DisplayItem: (props: Experience) => ExperienceUI(props)
    },
    "cl-info-pad": {
        item_type: "cl-item",
        isVertical: true,
        displayItemsClass: "text-item-list",
        DisplayItem: (props: string) => <div className="text-item" key={props}>{props}</div>
    }
};


const InfoPadMap = {
    // CV
    "languages":    "info-pad-text-list",
    "technologies": "info-pad-text-list",
    "courses":      "info-pad-text-list",
    "summaries":    "info-pad-text-list",
    "projects":     "experiences",
    "experience": "experiences",
    // CL
    "paragraphs":  "cl-info-pad",
}


export { Item, Bucket, BucketType, DEFAULT_ITEM_TYPE, BucketTypes, InfoPadMap };
import { Experience } from "shared";
import { ExperienceUI } from "../CVEditor/cveditor";
import { Item } from "./dnd";
import "./types.scss";

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
    }
};


const CVInfoPadMap = {
    "languages":    "info-pad-text-list",
    "technologies": "info-pad-text-list",
    "courses":      "info-pad-text-list",
    "summaries":    "info-pad-text-list",
    "projects":     "experiences",
}

export { BucketTypes, CVInfoPadMap }
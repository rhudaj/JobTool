import { ExperienceUI } from "../CVEditor/cveditor";
import { Item } from "./dnd"

interface BucketType {
    item_type: string,
    isVertical: boolean,
    DisplayItem: (props: Item) => JSX.Element,
    DisplayItems: (props: {children: JSX.Element[]}) => JSX.Element
}

const BucketTypes: { [key: string]: BucketType } = {
    "info-pad-text-list": {
        item_type: "text",
        isVertical: false,
        DisplayItem: (props: Item) => <div className="info-pad-item">{props.value}</div>,
        DisplayItems: (props: {children: JSX.Element[]}) => <div className="info-pad-items">{props.children}</div>
    },
    "experiences": {
        item_type: "experience",
        isVertical: true,
        DisplayItem: (props: Item) => <ExperienceUI {...props.value} />,
        DisplayItems: (props: {children: JSX.Element[]}) => <div className="experiences">{props.children}</div>
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
import "./types.scss";

interface BucketType {
    item_type: string,
    isVertical: boolean,
    displayItemsClass?: string
}

const BucketTypes: { [key: string]: BucketType } = {
    "info-pad-text-list": {
        item_type: "text",
        isVertical: false,
        displayItemsClass: "info-pad-items"
    },
    "experiences": {
        item_type: "experience",
        isVertical: true,
        displayItemsClass:"experiences",
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
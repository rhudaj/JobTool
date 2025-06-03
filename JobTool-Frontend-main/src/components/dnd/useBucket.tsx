import { Bucket, Item } from "./types";
import { Draft, produce } from "immer";    // the 'immer' libraris version of 'useReducer'
import { createContext } from 'react';

/* Empty all values in an object (recursively) */
const emptyObject = (obj: any): any => {
    // 3 CASES
    if (Array.isArray(obj)) {
        // 1: ARRAY (RECURSIVE)
        return obj.map(emptyObject);
    } else if (typeof obj === "object" && obj !== null) {
        // 2: OBJECT (RECURSIVE)
        return Object.fromEntries(
            Object.entries(obj).map(([key, val]) => [key, emptyObject(val)])
        );
    } else if (typeof obj == "number") {
        return 0;
    } else if (typeof obj == "string") {
        return "None";
    }
};

export interface BucketAction {
    type: string;
    payload: any;
};

const ActionTypes = {
    SET: "SET", // id: string, items: Item[]
    ADD: "ADD", // atIndex: number, item?: Item
    ADD_BLANK: "ADD_BLANK", // id: any, below: boolean
    MOVE: "MOVE",   // indexBefore: number, indexAfter: number
    REMOVE: "REMOVE",   // id: any
    CHANGE: "CHANGE",   // id: any, newValue: any
} as const;

type ActionMap = {
    [K in keyof typeof ActionTypes]: (D: Draft<Bucket<any>>, payload?: any) => void;
};

const getIdx = (id: any, items: Item<any>[]) => items.findIndex((I) => I.id === id);

const actionHandlers: ActionMap = {
    SET: (D, payload) => {
        const { id, items } = payload;
        D.id = id;
        D.items = items;
    },
    ADD: (D, payload) => {
        const { atIndex, item } = payload;
        D.items.splice(atIndex, 0, item);
    },
    ADD_BLANK: (D, payload) => {
        const { id, below } = payload;
        const index2add = getIdx(id, D.items) + (below ? 1 : 0);
        D.items.splice(index2add, 0, emptyObject(D.items[0]));    // deep copy
    },
    MOVE: (D, payload) => {
        const { indexBefore, indexAfter } = payload;
        const [movedItem] = D.items.splice(indexBefore, 1);
        D.items.splice(indexAfter, 0, movedItem);
    },
    REMOVE: (D, payload) => {
        const { id } = payload;
        D.items.splice(getIdx(id, D.items), 1);
    },
    CHANGE: (D, payload) => {
        const { id, newValue } = payload;
        D.items[getIdx(id, D.items)].value = newValue;
    },
}

// Reducer function
export const bucketReducer = (state: Bucket<any>, action: BucketAction) =>
    produce(state, (D) => actionHandlers[action.type]?.(D, action.payload));

const BucketContext = createContext<[Bucket<any>, React.Dispatch<BucketAction>]>(null);

export { BucketContext, ActionTypes as BucketActions };
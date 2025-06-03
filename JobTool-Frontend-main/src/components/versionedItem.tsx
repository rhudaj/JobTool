import { useEffect, useMemo, useState } from "react";
import { getBucketType, Item } from "./dnd/types";
import { StandaloneDragItem } from './dnd/BucketItem';
import TextEditDiv from './texteditdiv';
import { usePopup } from '../hooks/popup';
import { useImmer } from 'use-immer';
import { isEqual } from 'lodash';
import { ControlsBox } from './ControlBox';
import { create } from "zustand";
import { produce } from 'immer';
import { arrNullOrEmpty } from "../util";

export interface VersionedItem<T=any> {
    id: string,
    item_type: string,
    versions: Item<T>[],
};

// HELPER/SUB COMPONENTS

function EditNewItem(props: {
    startingItem: Item<any>;
    item_type: string;
    onSave: (newItem: Item<any>) => void;
}) {

    const bt = useMemo(
        () => getBucketType(props.item_type),
        [props.item_type]
    );

    const [id, setId] = useState(null);
    const [value, setValue] = useState(null);

    useEffect(()=>{
        setId(props.startingItem.id)
    }, [props.startingItem.id]);

    useEffect(() => {
        console.log('value = ', props.startingItem.value)
        setValue(props.startingItem.value)
    }, [props.startingItem.value]);

    if(!value) return;
    return (
        <div className="flex flex-col gap-4 p-4">
            <div className='name-edit'>
                <h3>Name:</h3>
                <TextEditDiv tv={id} onUpdate={setId}/>
            </div>
            <div className='content-edit'>
                <h3>Content:</h3>
                {bt.DisplayItem({
                    obj: value,
                    onUpdate: (newObj: any) => {
                        console.log('Changes have been made');
                        setValue(newObj);
                    }
                })}
            </div>
            <button onClick={()=>props.onSave({id: id, value: value})}>Save</button>
        </div>
    );
};

function EditExistingItem<T>(props: {
    item: Item<T>;
    item_type: string;
    onSaveChanges: (modItem: Item<T>) => void;
    onDeleteItem: () => void;
}) {

    const bt = useMemo(
        () => getBucketType(props.item_type),
        [props.item_type]
    );

    const [item, setItem] = useImmer<Item<T>>(null);
    const [changesMade, setChangesMade] = useState(false);

    // parent --> this
    useEffect(()=>{
        setItem(props.item);
    }, [props.item]);

    // check if any changes made compared to the OG item
    useEffect(()=>{
        setChangesMade(
            !isEqual(item, props.item)
        );
    }, [item]);


    const onIDUpdate = (newId: string) => {
        setItem(draft=>{
            draft.id = newId;
        })
    };

    const onValueUpdate = (newObj: any) => {
        console.log('Changes have been made');
        setItem(draft=>{
            draft.value = newObj;
        })
    };

    if(!item) return;
    return (
        <div className='item-edit'>
            <div className='name-edit'>
                <h3>Name:</h3>
                <TextEditDiv tv={item.id} onUpdate={onIDUpdate}/>
            </div>
            <div className='content-edit'>
                <h3>Content:</h3>
                {bt.DisplayItem({
                    obj: item.value,
                    onUpdate: onValueUpdate
                })}
            </div>
            <div id='edit-controls'>
                {/* DISABLE THE SAVE BUTTON IF NO CHANGES MADE */}
                <button disabled={!changesMade} onClick={()=>props.onSaveChanges(item)}>Save</button>
                <button onClick={props.onDeleteItem}>Delete</button>
            </div>
        </div>
    );
};

// MAIN COMPONENT


interface VersionStoreState {
    versions: Item<any>[]
    cur: number
    status: boolean
    init: (versions: Item<any>[]) => void
    switchCur: (cur: number) => void
    addNew: (newItem: Item<any>) => void
    editCur: (newItem: Item<any>) => void
    delCur: () => void
}
// creates a new Zustand store instance per component.
const useVersionStore = () =>
    create<VersionStoreState>((set, get) => ({
        versions: [],
        cur: 0,
        status: false, // wether updated or not (does not include first set)

        init: (versions: Item<any>[]) =>
            set({ versions: versions, status: false }),

        switchCur: () => {
            const idx = (get().cur + 1) % get().versions.length
            set({ cur: idx })
        },

        addNew: (newItem: Item<any>) =>
            set((state) => ({
                versions: [...state.versions, newItem],
                cur: state.versions.length, // Set to new last item
                status: true
            })),

        editCur: (newItem: Item<any>) =>
            set(produce(D=>{
                D.versions[D.cur] = newItem
                D.status = true
            })),

        delCur: () =>
            set((state) => ({
                versions: state.versions.filter((_, i) => i !== state.cur),
                cur: 0,
                status: true
            })),
    }));

/**
 * You can flip through versions, but
 * only the current version is draggable!
 * The current value itself is not dragged,
 * only the ID of the current value. It's
 * up to the dropped component to extract the value
 * corresponding to that ID.
 */
export function VersionedItemUI<T>(props: {
    obj: VersionedItem<T>,
    onUpdate?: (newObj: VersionedItem<T>) => void,
    className?: string,
}) {

    const bt = useMemo(
        () => getBucketType(props.obj.item_type),
        [props.obj.item_type]
    );

    // ----------------- STATE -----------------

    const useStore = useMemo(useVersionStore, []);  // Creates once, persists across renders
    const state = useStore();                       // Uses the same instance every render
    const _cur = useStore(s => s.versions[s.cur]);

    // Sync with parent only when props change
    useEffect(() => {
        state.init(props.obj.versions);
    }, [props.obj.versions]);

    // Notify parent when versions change, but ignore first render
    useEffect(() => {
        if(!state.status) return;
        props.onUpdate?.({ ...props.obj, versions: state.versions });
    }, [state.versions]);

    const editNewItemPopup = usePopup("Edit Item Version");

    // ----------------- CONTROLS -----------------

    const openEditNewItemPopup = () => {
        const copy = { ...state.versions[state.cur] }
        copy.id += "_copy";
        editNewItemPopup.open(
            <EditNewItem
                startingItem={copy}
                item_type={props.obj.item_type}
                onSave={(newItem: Item<T>) => {
                    state.addNew(newItem)
                    editNewItemPopup.close()
                }}
            />
        )
    };

    const openEditExistingPopup = () => {
        editNewItemPopup.open(
            <EditExistingItem
                item={state.versions[state.cur]}
                item_type={props.obj.item_type}
                onSaveChanges={(modifiedItem: Item<T>) => {
                    state.editCur(modifiedItem);
                    editNewItemPopup.close();
                }}
                onDeleteItem={() => {
                    state.delCur();
                    editNewItemPopup.close();
                }}
            />
        )
    };

    // ----------------- RENDER -----------------

    if (arrNullOrEmpty(state.versions)) return <div>No versions</div>
    if (!_cur) return <div>No current version</div>;

    const version_str = `${props.obj?.id}/${_cur?.id}`

    const dnd_item: Item<string> = {
        id: version_str,
        value: _cur?.value
    }

    return (
        <div className={"relative " + props.className}>
            {editNewItemPopup.component}
            {/* CONTROLS ARE FLOATING TO THE LEFT (NOT IN THE LAYOUT) */}
            <ControlsBox
                id="version-controls"
                placement="left"
                isVertical={true}
                controls={[
                    { id: "edit", icon_class: "fa-solid fa-pen", onClick: openEditExistingPopup },
                    { id:"switch", icon_class: "fa-solid fa-right-left", onClick: state.switchCur },
                    { id: "new", icon_class: "fa-solid fa-plus", onClick: openEditNewItemPopup }
                ]}
            />
            {/* this text is also floating */}
            <div title="id-container" className="absolute flex justify-end bottom-full w-full overflow-hidden">
                <p>{version_str}</p>
            </div>
            <StandaloneDragItem item={dnd_item} item_type={props.obj.item_type} >
                {bt.DisplayItem({
                    obj: _cur?.value,
                    disableBucketFeatures: true     // applies to any Item within a <BucketItems/>
                })}
            </StandaloneDragItem>
        </div>
    )
}

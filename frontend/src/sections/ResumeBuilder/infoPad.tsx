import React from "react";
import { Item } from '../../components/dnd/types';
import { VersionedItemUI, VersionedItem } from "../../components/versionedItem"
import { useImmer } from 'use-immer';
import { useCvsStore } from './useCVs';
import { arrNullOrEmpty } from "../../util";


export interface CVInfo {
    [ secName: string ]: {                  // section name
        [ groupName: string ]: {            // e.g. experience/project id
            [ itemName: string ]: any;      // e.g. id: experience content
        }
    }
}

interface SectionOfVersionedItems {
    secName: string;
    items: VersionedItem[];
}

// -----------------------------------------------------------------------
//                  FORMAT/CONVERT IN/OUT DATA
// -----------------------------------------------------------------------

/**
 * Map `CVInfo` sections to `BucketTypes` keys
 */
const InfoPadMap = {
    "summary":      "summary",
    "projects":     "projects",
    "experience":   "experiences",
    "education":    "experiences",
    "paragraphs":   "cl_info_pad",
}

const Info2Sections = (info: CVInfo): SectionOfVersionedItems[] => (
    Object.entries(info)
    .map( ([ secName, secGroups ]) => ({
        secName: secName,
        items: Object.entries(secGroups).map(([ groupName, groupItems ]) => ({
            id: groupName,
            item_type: InfoPadMap[secName],
            versions: Object.entries(groupItems).map(([id, value])=>({
                id: id,
                value: value
            } as Item<unknown>))
        } as VersionedItem))
    }))
);

const Sections2Info = (sections: { secName: string; items: VersionedItem<any>[] }[]): CVInfo => {
    const info: CVInfo = {};

    sections.forEach(({ secName, items }) => {
        if (!info[secName]) {
            info[secName] = {};
        }

        items.forEach(versionedItem => {
            const groupName = versionedItem.id;

            if (!info[secName][groupName]) {
                info[secName][groupName] = {};
            }

            versionedItem.versions.forEach(version => {
                info[secName][groupName][version.id] = version.value;
            });
        });
    });

    return info;
};

const useCVInfoFromAllCvs = () => {
    const ncvs = useCvsStore(s=>s.ncvs);
    const cvInfo = React.useMemo(() => {
        const sections: CVInfo = {}
        ncvs.forEach(cv => {
            const cv_name = cv.name
            cv.data.sections.forEach(section => {
                const section_name = section.name
                sections[section_name] = sections[section_name] || {}
                section.items.forEach((item: any) => {
                    let group_name
                    try {
                        group_name = (section_name === "summary") ? "default" : item.title
                    } catch (e) {
                        alert("Error with item: " + item)
                    }
                    sections[section_name][group_name] = sections[section_name][group_name] || {}
                    sections[section_name][group_name][cv_name] = item
                })
            })
        })
        return sections
    }, [ncvs])
    return cvInfo
};

// -----------------------------------------------------------------------
//                  MAIN COMPONENT
// -----------------------------------------------------------------------

export function InfoPad(props: {
    mode: 'ALL-CVS' | 'CV-INFO'
    // ONLY FOR WHEN mode == CV-INFO:
    info: CVInfo,
    onUpdate: (newInfo: CVInfo)=>void
}) {


    // ----------------- STATE -----------------

    const [state, setState] = useImmer({
        sections: [],
        status: false // only true if the user made changes
    });

    // ----------------- CONTROLS ------------------


    // if mode == 'ALL-CVS' you have to build the CVInfo yourself
    // and dont need props.info
    const extracted = useCVInfoFromAllCvs(); // hooks must be used at root level
    const info = React.useMemo(()=>{
        if(props.mode == "CV-INFO") {
            return props.info
        } else if (props.mode == "ALL-CVS") {
            return extracted;
        }
    }, [props.mode, props.info]);

    // Sync `sections` only when `info` changes, but don't overwrite user edits
    React.useEffect(() => {
        setState(D=>{
            D.sections = Info2Sections(info)
            D.status = false
        })
    }, [info])

    React.useEffect(() => {
        //* Only applies when: mode == CV-INFO
        if (props.mode !== 'CV-INFO' || !state.status) return;
        // <- sections have have been updated
        props.onUpdate( Sections2Info(state.sections) );
    }, [state.sections]);

    // ----------------- CONTROLS -----------------

    // this <-- children
    const onVersionedItemUpdate = (newVI: VersionedItem, sec_idx, item_idx) => {
        setState(D=>{
            D.sections[sec_idx].items[item_idx] = newVI
            D.status = true
        })
    }

    // ----------------- VIEW -----------------

    if (arrNullOrEmpty(state.sections)) {
        return <div id="info-pad">no CV info found</div>;
    }
    return (
        <div id="info-pad" className="flex flex-col gap-5 p-10 bg-white">
            {state.sections.map((sec, sec_idx: number) => (
                <div key={sec_idx} title="info-pad-section" >
                    <h2 className="mb-5 font-bold">{sec.secName.toUpperCase()}</h2>
                    <div title='section-items' className="flex flex-col gap-15">
                        {sec.items.map((vi: VersionedItem, i: number) =>
                            <VersionedItemUI
                                className="border-2 p-3 rounded-md"
                                key={i}
                                obj={vi}
                                onUpdate={(newVI: VersionedItem<unknown>)=>onVersionedItemUpdate(newVI, sec_idx, i)}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
};

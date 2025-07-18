import { CV, NamedCV } from "@/lib/types";
import { create } from 'zustand'
import { produce } from 'immer' // simplify changing nested state
import { isEqual } from "lodash";

interface State {
    ncvs: NamedCV[]
    status: boolean
    curIdx: number
    trackMods: boolean[]
}

interface Actions {
    fetch: () => Promise<void>
    update: (cv: CV) => void
    add: (cv: NamedCV) => void
    setCur: (idx: number) => void
    delCur: () => void
    findReplace: (find: string, replace: string) => void
    setStyle: (styles: any) => void
}

const log = (msg: string) => console.log(`[cvs state] ${msg}`)

// A store for CVState
const useCvsStore = create<State & Actions>((set, get) => ({
    ncvs: [],
    status: false,
    curIdx: 0,
    trackMods: [],
    // SETTERS ------------------------------------------------------
    fetch: async () => {
        fetchFromBackend()
        .then((cvList) => {
            set({ ncvs: cvList, curIdx: 0, status: true });
        })
        .catch((error) => {
            console.error("[cvs state] Fetch failed:", error);
            set({ status: false });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to fetch CVs!\n\n${errorMessage}`);
        })
    },
    update: (cv: CV) => {
        const idx = get().curIdx;
        set(produce((state) => {
            const cur = state.ncvs?.[idx]?.data;
            if (isEqual(cv, cur)) {
                log(`update: no changes detected, skipping`);
                return; // Avoid redundant updates
            }
            log(`update: changes detected`);
            state.ncvs[idx].data = cv;
            state.trackMods[idx] = true;
        }));
    },
    add: (cv) => {
        log(`add(cv: ${cv.name})`)
        set(produce(state => {
            state.ncvs.unshift(cv)
            state.trackMods.unshift(false)
            state.curIdx = 0
        }))
    },
    setCur: (idx) => {
        log(`setCur(idx: ${idx})`)
        set({ curIdx: idx })
    },
    delCur: () => {
        // NOTE: must get idx/name before calling set()
        const idx = get().curIdx
        const name = get().ncvs[idx].name
        log(`delete(name: ${name})`)
        set(produce(state => {
            state.ncvs.splice(state.curIdx, 1)
            state.trackMods.splice(state.curIdx, 1)
            state.curIdx = 0
        }))
        // for backend
        deleteFromBackend(name)
    },
    findReplace: (find: string, replace: string) => {
        const idx = get().curIdx;
        set(produce((state) => {
            if (!state.ncvs[idx]) return;

            // Convert CV to string, perform find/replace, then update
            const cvString = JSON.stringify(state.ncvs[idx].data);
            const updatedString = cvString.replace(new RegExp(find, 'g'), replace);

            try {
                state.ncvs[idx].data = JSON.parse(updatedString);
                state.trackMods[idx] = true;
            } catch (error) {
                console.error('Error parsing updated CV after find/replace:', error);
            }
        }));
    },
    setStyle: (styles: any) => {
        // This method updates global styles - it doesn't modify the CV data directly
        // The styles are managed by StyleManager, so we just trigger a re-render
        log('setStyle: Global styles updated');
        // Force a re-render by updating a timestamp or similar
        set(produce(state => {
            // Just trigger a state update to force re-render
            state.status = true;
        }));
    },
}))

// ---------------------------------------------------------------
//                             IN / OUT
// ---------------------------------------------------------------

const fetchFromBackend = async (): Promise<NamedCV[]> => {
    const response = await fetch('/api/cvs');
    if (!response.ok) {
        // Try to extract detailed error information
        let errorMessage = `Failed to fetch CVs: ${response.status} ${response.statusText}`;

        try {
            const errorData = await response.json();
            if (errorData.details) {
                errorMessage += `\nDetails: ${errorData.details}`;
            }
        } catch (e) {
            // If we can't parse the error response, use the default message
        }

        throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
}

const deleteFromBackend = async (name: string) => {
    try {
        const response = await fetch(`/api/cvs/${name}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete CV');
        }
        alert("Success! Deleted cv info");
    } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

const save2backend = async (ncv: NamedCV, overwrite: boolean) => {
    try {
        const response = await fetch(`/api/cvs${overwrite ? `/${ncv.name}` : ""}`, {
            method: overwrite ? "PUT" : "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ncv)
        });
        if (!response.ok) {
            throw new Error('Failed to save CV');
        }
        alert("Success! Saved cv info");
    } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// stores a CV object

export { useCvsStore, save2backend };

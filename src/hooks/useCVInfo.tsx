import { CVInfo } from "@/components/infoPad";
import { create } from "zustand";

// ------------------------------------------------------
//                          STATE
// ------------------------------------------------------

interface State {
    cv_info: CVInfo
    status: boolean
}

interface Actions {
    fetch: () => Promise<void>
    set: (newData: CVInfo) => void
}

const log = (msg: string) => console.log(`[cv_info state] ${msg}`)

// A store for CVState
const useCvInfoStore = create<State & Actions>((set, get) => ({
    cv_info: undefined,
    status: false,
    // SETTERS ------------------------------------------------------
    fetch: async () => {
        log("fetch");
        fetchFromBackend()
        .then(cv_info => {
            set({ cv_info: cv_info, status: true })
        })
        .catch(msg => {
            set({ status: false })
            alert(msg)
        })
    },
    set: (newData: CVInfo) => {
        log("set");
        set({ cv_info: newData });
        save2backend(newData);
    }
}))

// ---------------------------------------------------------------
//                             IN / OUT
// ---------------------------------------------------------------

const save2backend = async (cv_info: CVInfo) => {
    try {
        const response = await fetch('/api/cv-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cv_info)
        });
        if (!response.ok) {
            throw new Error('Failed to save CV info');
        }
        alert("Success! Saved cv info");
    } catch (error) {
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const fetchFromBackend = async (): Promise<CVInfo> => {
    const response = await fetch('/api/cv-info');
    if (!response.ok) {
        throw new Error('Failed to fetch CV info');
    }
    return response.json();
}

export { useCvInfoStore };
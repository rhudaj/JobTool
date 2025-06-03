import { CV, NamedCV } from "job-tool-shared-types";
import BackendAPI from "../../backend_api";
import { create } from 'zustand'
import { produce } from 'immer' // simplify changing nested state
import { isEqual } from "lodash";

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "1";
const SAMPLES_PATH = "samples";
const CVS_PATH = `${SAMPLES_PATH}/CVs`;

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
}

const log = (msg: string) => console.log(`[cvs state] ${msg}`)

// A store for CVState
const useCvsStore = create<State & Actions>((set, get) => ({
    ncvs: [],
    status: false,
    curIdx: null,
    trackMods: [],
    // SETTERS ------------------------------------------------------
    fetch: async () => {
        fetchFromBackend()
        .then((cvList) => {
            set({ ncvs: cvList, curIdx: 0, status: true });
        })
        .catch(() => {
            set({ status: false });
            alert("Failed to fetch CVs")
        })
    },
    update: (cv: CV) => {
        const idx = get().curIdx;
        set(produce((state) => {
            const cur = state.ncvs?.[idx]?.data;
            if (isEqual(cv, cur)) {
                return; // Avoid redundant updates
            }
            log(`update(cv: ${cv}`);
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
}))

// ---------------------------------------------------------------
//                             IN / OUT
// ---------------------------------------------------------------

const fetchFromBackend = async (): Promise<NamedCV[]> => {
    if(USE_BACKEND) {
        return BackendAPI.request<undefined, NamedCV[]>({ method: "GET", endpoint: "cvs" })
    } else {
        const sampleFiles = [
            "sample_resume1.json",
            "sample_resume2.json",
            "sample_resume3.json",
        ];
        return Promise.all(
            sampleFiles.map((file) =>
                fetch(`${CVS_PATH}/${file}`).then((r) => r.json())
            )
        )
    }
}

const deleteFromBackend = (name: string) => {
    BackendAPI.request({ method: "DELETE", endpoint: `cvs/${name}` })
    .then(() => alert("Success! Deleted cv info"))
    .catch(alert)
}

const save2backend = (ncv: NamedCV, overwrite: boolean) => {
    BackendAPI.request({
        method: overwrite ? "PUT" : "POST",
        endpoint: `cvs${overwrite ? `/${ncv.name}` : ""}`,
        body: ncv
    })
    .then(() => alert("Success! Saved cv info"))
    .catch(alert)
};

// stores a CV object

export { useCvsStore, save2backend };

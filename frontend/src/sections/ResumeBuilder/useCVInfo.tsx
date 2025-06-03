import BackendAPI from "../../backend_api";
import { CVInfo } from "./infoPad";
import { create } from "zustand";

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "1";
const SAMPLES_PATH = "samples";

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

const save2backend = (cv_info: CVInfo) => {
    BackendAPI.request<CVInfo>({
        method: "PUT",
        endpoint: "cv_info",
        body: cv_info,
    })
    .then(() => alert("Success! Saved cv info"))
    .catch(alert)
};

const fetchFromBackend = async (): Promise<CVInfo> =>
    USE_BACKEND ? (
        BackendAPI.request<undefined, CVInfo>({
            method: "GET",
            endpoint: "cv_info",
        })
    ) : (
        fetch(`${SAMPLES_PATH}/cv_info.json`).then(r => r.json())
    )

export { useCvInfoStore };
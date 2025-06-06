import { create } from 'zustand';
import { CVMetaInfo } from "@/lib/types";

interface State {
    metadata: CVMetaInfo[]
    status: boolean
}

interface Actions {
    fetch: () => Promise<void>
    refresh: () => Promise<void>
}

const log = (msg: string) => console.log(`[cv metadata state] ${msg}`)

export const useCvsMetadataStore = create<State & Actions>((set, get) => ({
    metadata: [],
    status: false,

    fetch: async () => {
        try {
            log("fetching metadata");
            const response = await fetch('/api/cvs/metadata');
            if (!response.ok) {
                throw new Error(`Failed to fetch CV metadata: ${response.status} ${response.statusText}`);
            }
            const metadata = await response.json();
            set({ metadata, status: true });
        } catch (error) {
            console.error("[cv metadata state] Fetch failed:", error);
            set({ status: false });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to fetch CV metadata!\n\n${errorMessage}`);
        }
    },

    refresh: async () => {
        get().fetch();
    }
}));

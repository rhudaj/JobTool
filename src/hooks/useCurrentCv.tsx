import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { isEqual } from "lodash";
import { CV, NamedCV } from "@/lib/types";

interface CurrentCvState {
    // Current CV data
    cv: NamedCV | null
    // Original CV from backend (for comparison)
    originalCv: NamedCV | null
    // Whether current CV has unsaved modifications
    isModified: boolean
    // Loading state
    isLoading: boolean
    // Error state
    error: string | null
}

interface CurrentCvActions {
    // Load a CV by name from backend
    loadCv: (name: string) => Promise<void>
    // Update the current CV data (marks as modified)
    updateCv: (cv: CV) => void
    // Save current CV to backend (clears modified flag)
    saveCv: () => Promise<void>
    // Save current CV with new name/metadata
    saveCvAs: (metadata: { name: string; path?: string; tags?: string[] }) => Promise<void>
    // Reset to original (discard changes)
    discardChanges: () => void
    // Clear current CV (with optional unsaved changes warning)
    clearCv: (force?: boolean) => boolean
    // Find and replace in current CV
    findReplace: (find: string, replace: string) => void
    // Check if there are unsaved changes
    hasUnsavedChanges: () => boolean
}

const log = (msg: string) => console.log(`[current cv state] ${msg}`)

export const useCurrentCvStore = create<CurrentCvState & CurrentCvActions>()(
    persist(
        (set, get) => ({
            // Initial state
            cv: null,
            originalCv: null,
            isModified: false,
            isLoading: false,
            error: null,

            // Actions
            loadCv: async (name: string) => {
                const state = get();

                // Check for unsaved changes before loading new CV
                if (state.isModified && state.cv) {
                    const shouldProceed = confirm(
                        `You have unsaved changes to "${state.cv.name}". Loading a new CV will discard these changes. Continue?`
                    );
                    if (!shouldProceed) {
                        return;
                    }
                }

                set({ isLoading: true, error: null });

                try {
                    log(`loading CV: ${name}`);
                    const response = await fetch(`/api/cvs/${encodeURIComponent(name)}`);

                    if (!response.ok) {
                        throw new Error(`Failed to load CV: ${response.status} ${response.statusText}`);
                    }

                    const cv: NamedCV = await response.json();

                    console.debug(`Found CV with name '${name}': `, cv);

                    set({
                        cv,
                        originalCv: JSON.parse(JSON.stringify(cv)), // Deep copy for comparison
                        isModified: false,
                        isLoading: false,
                        error: null
                    });

                    log(`successfully loaded CV: ${name}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    console.error("[current cv state] Load failed:", error);
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    alert(`Failed to load CV "${name}"!\n\n${errorMessage}`);
                }
            },

            updateCv: (cv: CV) => {
                const state = get();
                if (!state.cv) {
                    log("updateCv: no current CV to update");
                    return;
                }

                console.debug("useCurrentCv.updateCv - RECEIVED CV:", cv);

                set(produce((draft) => {
                    if (!draft.cv || !draft.originalCv) return;

                    // Check if the update actually changes anything
                    if (isEqual(cv, draft.cv.data)) {
                        log("updateCv: no changes detected, skipping");
                        return;
                    }

                    log("updateCv: changes detected, updating");
                    draft.cv.data = cv;
                    draft.isModified = !isEqual(draft.cv.data, draft.originalCv.data);

                    console.debug("useCurrentCv.updateCv - UPDATED STATE:", draft.cv);
                }));
            },

            saveCv: async () => {
                const state = get();

                console.debug("STATE OF CV BEFORE SAVE:", state.cv);

                if (!state.cv || !state.isModified) {
                    log("saveCv: nothing to save");
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    log(`saving CV: ${state.cv.name}`);
                    const response = await fetch(`/api/cvs/${encodeURIComponent(state.cv.name)}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(state.cv),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to save CV: ${response.status} ${response.statusText}`);
                    }

                    // Update original to match current (no longer modified)
                    set(produce((draft) => {
                        if (draft.cv) {
                            draft.originalCv = JSON.parse(JSON.stringify(draft.cv));
                            draft.isModified = false;
                            draft.isLoading = false;
                            draft.error = null;
                        }
                    }));

                    log(`successfully saved CV: ${state.cv.name}`);
                    alert("Success! CV saved");
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    console.error("[current cv state] Save failed:", error);
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    alert(`Failed to save CV!\n\n${errorMessage}`);
                }
            },

            saveCvAs: async (metadata) => {
                const state = get();
                if (!state.cv) {
                    log("saveCvAs: no current CV to save");
                    return;
                }

                set({ isLoading: true, error: null });

                const cvToSave: NamedCV = {
                    ...state.cv,
                    name: metadata.name,
                    path: metadata.path || state.cv.path,
                    tags: metadata.tags || state.cv.tags,
                };

                try {
                    log(`saving CV as: ${metadata.name}`);
                    const response = await fetch('/api/cvs', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(cvToSave),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to save CV: ${response.status} ${response.statusText}`);
                    }

                    // Update current CV to the new name and mark as unmodified
                    set(produce((draft) => {
                        draft.cv = cvToSave;
                        draft.originalCv = JSON.parse(JSON.stringify(cvToSave));
                        draft.isModified = false;
                        draft.isLoading = false;
                        draft.error = null;
                    }));

                    log(`successfully saved CV as: ${metadata.name}`);
                    alert("Success! CV saved");
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    console.error("[current cv state] Save as failed:", error);
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    alert(`Failed to save CV!\n\n${errorMessage}`);
                }
            },

            discardChanges: () => {
                const state = get();
                if (!state.originalCv) {
                    log("discardChanges: no original CV to revert to");
                    return;
                }

                const shouldDiscard = confirm(
                    "Are you sure you want to discard all unsaved changes?"
                );

                if (shouldDiscard) {
                    set(produce((draft) => {
                        if (draft.originalCv) {
                            draft.cv = JSON.parse(JSON.stringify(draft.originalCv));
                            draft.isModified = false;
                        }
                    }));
                    log("discarded changes");
                }
            },

            clearCv: (force = false) => {
                const state = get();

                if (state.isModified && !force) {
                    const shouldClear = confirm(
                        `You have unsaved changes to "${state.cv?.name}". Clearing will discard these changes. Continue?`
                    );
                    if (!shouldClear) {
                        return false;
                    }
                }

                set({
                    cv: null,
                    originalCv: null,
                    isModified: false,
                    error: null
                });

                log("cleared current CV");
                return true;
            },

            findReplace: (find: string, replace: string) => {
                const state = get();
                if (!state.cv) {
                    log("findReplace: no current CV");
                    return;
                }

                set(produce((draft) => {
                    if (!draft.cv || !draft.originalCv) return;

                    // Convert CV to string, perform find/replace, then update
                    const cvString = JSON.stringify(draft.cv.data);
                    const updatedString = cvString.replace(new RegExp(find, 'g'), replace);

                    try {
                        draft.cv.data = JSON.parse(updatedString);
                        draft.isModified = !isEqual(draft.cv.data, draft.originalCv.data);
                        log(`findReplace: replaced "${find}" with "${replace}"`);
                    } catch (error) {
                        console.error('Error parsing updated CV after find/replace:', error);
                    }
                }));
            },

            hasUnsavedChanges: () => {
                return get().isModified;
            },
        }),
        {
            name: 'current-cv-storage',
            partialize: (state) => ({
                cv: state.cv,
                originalCv: state.originalCv,
                isModified: state.isModified,
                // Don't persist loading/error states
            }),
        }
    )
);

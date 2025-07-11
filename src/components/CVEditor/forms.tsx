import TextItems from "@/components/TextItems";
import { CVMetaInfo, NamedCV } from "@/lib/types";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useState } from "react";

/**
 * Notes on "react-hook-form"
 * --------------------------
 * `register`
 *
 *      SOURCE: https://react-hook-form.com/docs/useform/register
 *      WHAT? method to register an input|select element & apply validation rules to React Hook Form.
 *      EXAMPLE: register('name', { required: true })
 *      RETURNS: { ref, name, onChange, onBlur }
 *
 * `watch
 *      WHY? e.g. useForm() doesn't automatically update the state when onBlur triggers onChange(). The form loses control over its state.
 *           Instead of onBlur, use watch() to monitor field values and call onChange only when they actually change.

*/

const CustomStyles = {
    popup_content: "flex flex-col align-center gap-3 p-2",
};

export interface SaveFormData extends CVMetaInfo {
    // For annotations
    jobText?: string;
}
export const SaveForm = (props: {
    cvInfo: CVMetaInfo;
    onSave: (formData: SaveFormData) => void;
    disabled?: boolean;
    saveAnnotation?: boolean;
}) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SaveFormData>({
        defaultValues: {
            name: "untitled",
            path: "/",
            tags: [],
            jobText: "",
        },
        values: props.cvInfo,
        resolver: async (data) => {
            // Custom validation
            const errors: Record<string, { message: string }> = {};
            if (!data.name) errors.name = { message: "File name required!" };
            if (!data.path) errors.path = { message: "Path required!" };
            return { values: data, errors };
        },
    });

    return (
        <form
            className="grid grid-cols-[min-content_1fr] gap-4"
            onSubmit={handleSubmit(props.onSave)}
        >
            {/* FIELD #1 -- NAME */}
            <label>Name:</label>
            <div>
                <input name="file-name" type="text" {...register("name")}/>
                <p>{errors.name?.message}</p>
            </div>

            {/* FIELD #2 -- PATH */}
            <label>Path:</label>
            <div>
                <input name="path" type="text" {...register("path")} />
                <p>{errors.path?.message}</p>
            </div>

            {/* FIELD #3 -- TAGS */}
            <label>Tags:</label>
            <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                    <TextItems
                        initItems={field.value}
                        // NOTE: the native <form> element wont react to changes. Only the react-hook-form.
                        onUpdate={(newTags: string[]) =>
                            field.onChange(newTags)
                        }
                    />
                )}
            />
            <button type="submit">Save</button>
        </form>
    );
};

export const ExportForm = (props: {
    onPDFClicked: () => void;
    onJsonClicked: () => void;
}) => {
    return (
        <div className="flex gap-4">
            <button
                type="button"
                onClick={props.onPDFClicked}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Export as PDF
            </button>
            <button
                type="button"
                onClick={props.onJsonClicked}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Export as JSON
            </button>
        </div>
    );
};

export const AnnotationForm = (props: {
    onSubmit: (formData: { job?: string }) => void;
}) => {
    const { register, handleSubmit, formState } = useForm<{ job?: string }>({
        defaultValues: { job: "" },
    });

    const [submitDone, setSubmitDone] = useState(false);

    const onSubmit = (data: { job?: string }) => {
        props.onSubmit(data);
        setSubmitDone(true);
    };

    return (
        <form
            className="flex flex-col gap-10"
            onSubmit={handleSubmit(onSubmit)}
        >
            <label>Job Text</label>
            <textarea
                {...register("job", { required: true })}
                placeholder="Paste a job description"
                className="min-h-30 align-top"
            />
            <button type="submit" disabled={!formState.isValid || submitDone}>
                Submit
            </button>
        </form>
    );
};

interface ImportForm {
    name: string;
    pasted_text: string;
}
export const ImportForm = (props: { cb: (ncv: NamedCV) => void }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ImportForm>();

    const onSubmit: SubmitHandler<ImportForm> = (data) => {
        console.log(`form data: `, data);
        if (data.pasted_text) {
            let parsed: any;
            try {
                parsed = JSON.parse(data.pasted_text);
                props.cb({
                    name: data.name,
                    path: "/",
                    data: parsed,
                    tags: [],
                });
            } catch (err: unknown) {
                console.log("Error with your pasted text!");
            }
        }
    };

    return (
        <form
            className={CustomStyles.popup_content}
            id="import-form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <label>Copy/Paste</label>
            <textarea
                {...register("pasted_text", { required: true })}
                className="json-paste-area"
                placeholder="paste json"
            />
            {errors.pasted_text && <span>field required</span>}

            <label>Name</label>
            <input
                type="text"
                defaultValue="untitled"
                {...register("name", { required: true })}
            />

            <button type="submit">Done</button>
        </form>
    );
};

interface FindReplaceFormInput {
    find: string;
    replace: string;
}
export const FindReplaceForm = (props: {
    cb: (data: FindReplaceFormInput) => void;
}) => {
    const {
        register,
        handleSubmit, // validates input before calling `onSubmit`
        formState: { errors },
    } = useForm<FindReplaceFormInput>();
    const onSubmit: SubmitHandler<FindReplaceFormInput> = props.cb;

    return (
        <form
            className={CustomStyles.popup_content}
            id="find-replace"
            onSubmit={handleSubmit(onSubmit)}
        >
            {/* FIND TEXT */}
            <input
                type="text"
                placeholder="find"
                {...register("find", { required: true })}
                className="border p-1"
            />
            {errors.find && <span>field required</span>}

            {/* REPLACE TEXT */}
            <input
                type="text"
                placeholder="replace"
                {...register("replace", { required: true })}
                className="border p-1"
            />
            {errors.replace && <span>field required</span>}

            <button type="submit">Go</button>
        </form>
    );
};

import { useStyles } from "./styles";

export const StylesForm = () => {
    const { styles, setStyle, getAllStyles } = useStyles();

    const handleUpdate = (key: string, val: number) => {
        console.log(`(Styles) Updating ${key} to ${val}`);
        setStyle(key as any, val);
    };

    return (
        <form
            id="styles-form"
            className="flex flex-col gap-2 w-full max-h-500 overflow-y-scroll"
        >
            {Object.entries(getAllStyles()).map(([key, val], idx) => (
                <div
                    key={`${key}-${idx}`}
                    className="grid grid-cols-2 gap-2 items-center border-b"
                >
                    <label>{key}</label>
                    <input
                        className="w-min text-right"
                        type="number"
                        defaultValue={styles[key]}
                        onBlur={(e) =>
                            handleUpdate(key, Number(e.target.value))
                        }
                    />
                </div>
            ))}
        </form>
    );
};

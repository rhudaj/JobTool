import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions from src/util directory

export const arrNullOrEmpty = (arr: any[]) =>
    !arr || arr.length === 0

export const joinClassNames = (className: any, ...classNames: any) => {
    // handle the case where some might be undefined
    const classes = [className]
    classes.push(...classNames)
    return classes.filter((c) => String(c)).join(" ");
}

export function capitlize(txt: string) {
    return txt.substring(0, 1).toUpperCase() +
        txt.substring(1)
}

export const jsonFileImport = (
    event: React.ChangeEvent<HTMLInputElement>,
    handleData: (props: {name: string, data: any}) => void) => {

    const file = event.target.files?.[0]; // Get the selected file
    if (!file) return;
    const name = file.name.split(".json")[0]

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const json_str = e.target?.result as string; // File content as text
            const data = JSON.parse(json_str);
            // *** call the callback ***
            handleData({name, data})
        } catch (error) {
            alert("Invalid .json file")
            throw Error(`Error parsing JSON file: ${error}`);
        }
    };

    reader.readAsText(file); // Start reading the file
};

export const jsonFileExport = (
    data: any,
    name: string,
    addExtension?: boolean
) => {
    const fileName = addExtension ? `${name}.json` : name;
    const jsonStr = JSON.stringify(data, null, 2); // Pretty-print JSON
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the object URL
    URL.revokeObjectURL(url);
};

/** save the object as .json file to the Downloads folder */
export const downloadAsJson = (data: any) => {

    // get the modified cv:
    const jsonString = JSON.stringify(data);

    // Prompt the user to enter a custom filename
    const filename = window.prompt("Enter a filename for your JSON file:", "my_resume");
    if(!filename) return;

    // Create a Blob (file-like object) from the JSON string:
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;  // Use the filename entered by the user
    link.click();  // Trigger the download
};

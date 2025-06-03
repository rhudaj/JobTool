import { useState } from "react";

export function useToggle(initState?: boolean): [boolean, (ev: React.MouseEvent|boolean) => void] {
    const [on, setOn] = useState(initState ?? false); // default to false if not specified
    const toggle = (ev: React.MouseEvent|boolean) => {
        if(typeof ev === "boolean") {
            setOn(ev);
        } else {
            setOn(prev=>!prev);
        }
    }
    return [on, toggle];
}
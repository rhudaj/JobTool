import { ReactElement } from "react";
import "./buttonSet.scss"

export function ButtonSet(props: {
    children: React.ReactNode | ReactElement[]
}) {
    return (
        <div className="button-set">
            {props.children}
        </div>
    )
}
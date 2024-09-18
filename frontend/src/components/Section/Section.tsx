import "./Section.css";
import { ReactElement } from "react";

export function Section(props: {
    id: string;
    heading: string;
    isLoading: boolean;
    children: ReactElement;
}) {
    return (
        <div className={`AppSection`} id={props.id}>
            <h1>{props.heading}</h1>
            <div className="section-content loading-div">
                {
                    props.isLoading
                    ? <span className="loader" />
                    : props.children
                }
            </div>
        </div>
    );
}

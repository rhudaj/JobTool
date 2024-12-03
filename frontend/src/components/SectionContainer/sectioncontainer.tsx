import { joinClassNames } from "../../hooks/joinClassNames";
import "./sectioncontainer.scss"

export function SectionContainer(props: {
    hasPrev: boolean;
    hasNext: boolean;
    nextEnabled: boolean;
    onChangeSection: (next: boolean) => void;
    onSkipSection: () => void;
    children: React.ReactNode;
}) {
    const ChangeSection = (P: { dirIsNext: boolean, enabled: boolean }) => {
        const classNames = joinClassNames("change-section-button", P.enabled ? "" : "disabled")
        return (
            <button
                className={classNames}
                onClick={() => props.onChangeSection(P.dirIsNext)}
            >
                {P.dirIsNext ? "→" : "←"}
            </button>
        );
    };

    return (
        <div className="section-container">
            <div id="section-select">
                <ChangeSection dirIsNext={false} enabled={props.hasPrev}/>
                <button id="skip-button" onClick={props.onSkipSection}>Skip</button>
                <ChangeSection dirIsNext={true} enabled={props.hasNext && props.nextEnabled}/>
            </div>
            {props.children}
        </div>
    );
}
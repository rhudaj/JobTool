import "./sectioncontainer.css"

export function SectionContainer(props: {
    hasPrev: boolean;
    hasNext: boolean;
    nextEnabled: boolean;
    onChangeSection: (next: boolean) => void;
    children: React.ReactNode;
}) {
    const ChangeSection = (P: { dirIsNext: boolean, enabled: boolean }) => {
        return (
            <button
                className={`change-section-button ${
                    P.enabled ? "" : "disabled"
                }`}
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
                <ChangeSection dirIsNext={true} enabled={props.hasNext && props.nextEnabled}/>
            </div>
            {props.children}
        </div>
    );
}
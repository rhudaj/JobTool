import "./SubSection.css"

export function SubSection(props: {
    id: string;
    heading: string;
    children: React.ReactNode;
}) {
    return (
        <div className="sub-section">
            <h3>{props.heading}</h3>
            <div className="content">{props.children}</div>
        </div>
    );
};
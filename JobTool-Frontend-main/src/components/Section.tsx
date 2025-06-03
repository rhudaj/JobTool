export function Section(props: {
    id: string;
    heading: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col p-10" id={props.id}>
            <h1 className="mb-10 text-3xl border-b-4" >{props.heading}</h1>
            <div className="flex flex-col gap-10">
                { props.children }
            </div>
        </div>
    );
}

export function SubSection(props: {
    id?: string;
    heading?: string;
    children?: React.ReactNode,
}) {
    return (
        <div className="flex flex-col border-3 border-solid p-3">
            {props.heading &&
            <h3 className="font-bold text-2xl">{props.heading}</h3>
            }
            <div id={props.id} className="overflow-y-scroll">{props.children}</div>
        </div>
    );
};
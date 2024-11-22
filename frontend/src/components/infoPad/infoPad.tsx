interface Info {
    title: string,
    items: string[],
};

function Draggable(props: { item: any }) {
    return (
        <div className="draggable">
            {props.item}
        </div>
    );
};

function Info(props: Info) {
    return (
        <div className="info">
            <h2>{props.title}</h2>
            <div className="item-bin">
                {
                    props.items.map(I => (
                        <Draggable item={I} />
                    ))
                }
            </div>
        </div>
    );
};

export function InfoPad(props: {
    infoParts: Info[]
}) {
    return (
        <div className="info-pad">
            {
                props.infoParts.map((info: Info) => (
                    <Info {...info} />
                ))
            }
        </div>
    );
}
import { joinClassNames } from "../../hooks/joinClassNames";

function Grid(props: {
    rows_cols: (any | any[])[],
    rowGapPct?: string,
    colGapPct?: string,
    className?: string,
    id?: string,
}) {
    const classNames = joinClassNames("grid-rows", props.className);

    const rowsCSS: React.CSSProperties = {
        "display": "grid",
        "gridAutoRows": "min-content", // same as repeat(N, min-content), where N = # rows
        "rowGap": `${props.rowGapPct}%`,
    };

    const columnsCSS: React.CSSProperties = {
        "display": "grid",
        "gridTemplateColumns": "repeat(auto-fit, minmax(0, 1fr))",
        "columnGap": `${props.colGapPct}%`,
    };

    return (
        <div className={classNames} style={rowsCSS} id={props.id ?? ""}>
            {props.rows_cols.map((row, i) => (
                !Array.isArray(row) ? row :
                    <div className="columns" style={columnsCSS}>{row}</div>
            ))}
        </div>
    );
};

export { Grid };
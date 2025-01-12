import { joinClassNames } from "../../../hooks/joinClassNames";
import React from "react";

function Grid(props: {
    rows_cols: (JSX.Element | JSX.Element[])[],
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
                !Array.isArray(row) ?
                    React.cloneElement(row, { key: i }) :
                    <div key={i} className="columns" style={columnsCSS}>
                        {row.map((col, j) => React.cloneElement(col, { key: j }))}
                    </div>
            ))}
        </div>
    );
};

export { Grid };
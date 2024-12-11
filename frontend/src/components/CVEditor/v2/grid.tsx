import "./grid.scss"
import { joinClassNames } from "../../../hooks/joinClassNames";

function Grid(props: {
    rows_cols: (any | any[])[],
    className?: string,
    id?: string
}) {
    const classNames = joinClassNames("grid", props.className);
    return (
        <div className={classNames} id={props.id ?? ""}>
            {props.rows_cols.map((row, i) => (
                !Array.isArray(row) ? row :
                    <div className="columns">{row}</div>
            ))}
        </div>
    );
};

export { Grid };
import { ReactElement, useState } from "react";
import "./customTable.css";

function CustomTable(props: {
    data: any[];
    handleCell?: (data: any) => any;
    headers?: string[];
    changeData: (newArr: any[]) => void;
}) {
    const Row = (P: { rowData: any[]; rowNum: number }) => {
        const [dataHover, setDataHover] = useState(false);
        const [delHover, setDelHover] = useState(false);
        return (
            <tr
                className={delHover ? "delHover" : ""}
                onMouseEnter={() => setDataHover(true)}
                onMouseLeave={() => setDataHover(false)}
            >
                {
                    // map <item> to columns
                    P.rowData.map((colData: any) => (
                        <td
                            className={`data-col ${
                                dataHover && !delHover ? "hover" : ""
                            }`}
                        >
                            {props.handleCell
                                ? props.handleCell(colData)
                                : colData}
                        </td>
                    ))
                }
                <td
                    className="row-removal-col"
                    onMouseEnter={() => setDelHover(true)}
                    onMouseLeave={() => setDelHover(false)}
                    onClick={() => {
                        // remove the row from the data
                        console.log("Removing row # ", P.rowNum);
                        const newArr = props.data;
                        newArr.splice(P.rowNum, 1); // in-place
                        props.changeData(newArr);
                    }}
                >
                    {dataHover ? "x" : ""}
                </td>
            </tr>
        );
    };

    if (!props.data) return <p>n/a</p>;
    else
        return (
            <table className="custom-table">
                <tbody>
                    {
                        // Header row is not mandatory
                        props.headers ? (
                            <tr id="header-row">
                                {props.headers.map((head) => (
                                    <td>{head}</td>
                                ))}
                            </tr>
                        ) : (
                            <></>
                        )
                    }
                    {
                        // Map each item of data to a row
                        props.data.map((item: any, itemNum: number) => (
                            <Row
                                rowData={
                                    // ensure <item> is an array if not already
                                    Array.isArray(item) ? item : [item]
                                }
                                rowNum={itemNum}
                            />
                        ))
                    }
                </tbody>
            </table>
        );
}

export { CustomTable };

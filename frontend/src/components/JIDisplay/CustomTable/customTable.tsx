import { useEffect, useState } from "react";
import "./customTable.css";
import { useLogger } from "../../../hooks/logger";

function CustomTable(props: {
    data: any[];
    headers?: string[];
    changeData: (newArr: any[]) => void;
}) {
    const [data, setData] = useState([]);

    const log = useLogger("CustomTable");

    useEffect(()=>{
        if( ! Array.isArray(props.data) ) {
            log("WARNING: CustomTable data prop is not an array. Putting data into an array (may not be what you want)");
            setData([props.data]);
        } else {
            log('new props.data for table');
            setData(props.data);
        }
    }, [props.data]);

    // TOOLS -------------------------

    const removeRow = (rowNum: number) => {
        // remove entry from the data
        log("Removing row # ", rowNum);
        const newArr = data;
        newArr.splice(rowNum, 1); // in-place
        props.changeData(newArr);
    };

    const addRow = () => {
        // add entry to the data
        log("Adding row");
        const newArr = data;
        const numCols = Array.isArray(data[0]) ? data[0].length : 1;
        newArr.push(new Array(numCols).fill(""));
        props.changeData(newArr);
    };

    // SUB-COMPONENTS -----------------

    const HeaderRow = () => (
        <tr
            key='header-row'
            id="header-row"
        >
            { props.headers.map((h,i) => <td key={i}>{h}</td>) }
        </tr>
    );

    const DataRow = (rowP: { rowData: any[]; rowNum: number }) => {
        const [rowData, setRowData] = useState([]);

        useEffect(() => {
            setRowData(rowP.rowData);
        }, [rowP.rowData]);

        const Col = (colP: {colData: any, colNum: number}) => {
            return (
                <td
                    key={`row-${rowP.rowNum}-col-${colP.colNum}`} // helps React render
                    className="data-col"
                    contentEditable={true}
                    onInput={e=>{
                        // TODO: data should not be updated until
                        const newRD = rowData;
                        newRD[colP.colNum] = e.currentTarget.innerText;
                        setRowData(newRD);
                    }}
                >
                    {colP.colData}
                </td>
            );
        };

        const RowRemovalCol = () => (
            <td
                key={`row-${rowP.rowNum}-removal-col`}
                className="row-removal-col"
                onClick={() => removeRow(rowP.rowNum)}
            />
        );

        if (!data || data.length === 0) {
            return <p>n/a</p>;
        }
        else return (
            <tr key={`row-${rowP.rowNum}`}>
                {
                    rowData.map((rowItem: any, i: number) =>
                        <Col key={i} colData={rowItem} colNum={i}/>
                    )
                }
                <RowRemovalCol/>
            </tr>
        );
    };

    const RowAdderRow = () => (
        <tr
            id="row-adder"
            onClick={addRow}
        >
            <td colSpan={Array.isArray(data[0]) ? data[0].length : 1}>
                +
            </td>
        </tr>
    );

    if (!data || data.length === 0) return <p>n/a</p>;
    else return (
        <table className="custom-table">
            <tbody>
                { props.headers ? <HeaderRow/> : <></>}
                {
                    // Map each item of data to a row
                    data.map((rowData: any, rowNum: number) => (
                        <DataRow
                            key={rowNum}
                            rowData={
                                // ensure <item> is an array if not already
                                Array.isArray(rowData) ? rowData : [rowData]
                            }
                            rowNum={rowNum}
                        />
                    ))
                }
                <RowAdderRow/>
            </tbody>
        </table>
    );
}

export { CustomTable };
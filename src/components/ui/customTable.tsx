import { useImmer } from "use-immer";
import { useEffect, useState } from "react";
import * as Util from "@/lib/utils";

function CustomTable(props: {
    data: any[];
    headers?: string[];
    changeData: (newArr: any[]) => void;
}) {
    const [data, setData] = useImmer<any[]>([]);

    useEffect(()=>{
        setData(props.data);
    }, [props.data]);

    useEffect(()=>{
        if (data == props.data) return;
        props.changeData(data);
    }, [data])

    // TOOLS -------------------------

    const removeRow = (rowNum: number) => {
        setData(draft=>{
            draft.splice(rowNum, 1);
        });
    };

    const addRow = () => {
        setData(draft=>{
            const numCols = Array.isArray(data[0]) ? data[0].length : 1;
            draft.push(new Array(numCols).fill(" "));
        });
    };

    // SUB-COMPONENTS -----------------

    const HeaderRow = () => (
        <tr key='header-row' id="header-row">
            {props.headers?.map((h,i) =>
                <td key={`header-col-${i}`}>{h}</td>
            )}
        </tr>
    );

    const DataRow = (rowP: { rowData: any[]; rowNum: number }) => {

        const [rowData, setRowData] = useImmer<any[]>([]);

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
                        setRowData(draft=>{
                            draft[colP.colNum] = e.currentTarget.innerText;
                        });
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

        if (Util.arrNullOrEmpty(data)) {
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
        <tr id="row-adder" onClick={addRow}>
            <td colSpan={data[0]?.length ?? 1}>+</td>
        </tr>
    );

    if (Util.arrNullOrEmpty(data)) return <p>n/a</p>;
    else return (
        <table className="custom-table">
            <tbody>
                { props.headers ? <HeaderRow/> : <></>}
                {
                    // Map each item of data to a row
                    data.map((rowData: any, rowNum: number) => (
                        <DataRow key={`row-${rowNum}`} rowNum={rowNum} rowData={
                            // ensure item is an array if not already
                            Array.isArray(rowData) ? rowData : [rowData]
                        }/>
                    ))
                }
                <RowAdderRow/>
            </tbody>
        </table>
    );
}

export default CustomTable;
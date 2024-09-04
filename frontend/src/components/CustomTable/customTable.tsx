import "./customTable.css";

function CustomTable(props: { data: any[]; headers: string[] }) {
    if (!props.data) return <p>n/a</p>;
    return (
        <table className="custom-table">
            <tbody>
                <tr id="header-row">
                    {props.headers.map((head) => (
                        <td>{head}</td>
                    ))}
                </tr>
                {
                    props.data.map((item: any) => {
                        let arr = Array.isArray(item) ? item : [item];
                        return (
                            <tr>
                                {
                                    arr.map(item=><td>{item}</td>)
                                }
                            </tr>
                        );
                    })
                }
            </tbody>
        </table>
    );
}

export { CustomTable };

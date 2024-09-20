import "./texteditdiv.css";
export function TextEditDiv(props: {
    text: string,
    id?: string,
    className?: string
}) {
    return(
        <div
            className={`text-edit-div ${props.className}`}
            id={props.id}
            contentEditable={true}
        >
            {props.text}
        </div>
    );
}

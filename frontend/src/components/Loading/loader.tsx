import './loader.css';

export function Loader(props: {
    isLoading: boolean;
    children: React.ReactNode;
}) {
    if (props.isLoading) {
        return <span className="loader"/>
    } else {
        return <>{ props.children }</>
    }
}
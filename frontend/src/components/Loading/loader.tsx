import './loader.scss';

// TODO: convert into a hook which subscribes to some state change. 
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
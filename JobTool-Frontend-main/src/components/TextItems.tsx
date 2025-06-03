import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";

const TextItems = (props: {
    initItems?: string[],
    onUpdate: (newItems: string[]) => void,
}) => {

    const [items, setItems] = useImmer<string[]>(props.initItems || []);
    const text_ref = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        console.log('TextItems calling props.onUpdate')
        props.onUpdate(items);
    }, [items]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter') return; // only care ab
        e.preventDefault();
        const new_item = text_ref.current.textContent.trim();
        if(!new_item) return;
        if(items.find(t=>t===new_item)) return;
        setItems(draft=>{draft.push(new_item)});
        text_ref.current.innerHTML = "";
    };

    const onDeleteItem = (idx: number) => {
        setItems(draft=>{
            draft.splice(idx, 1);
        })
    }

    if (!items) return null;
    return (
        <div title="text-items" className="text-left ltr w-full h-max flex flex-col gap-2">
            <div
                title="text-input"
                className="p-2 w-full bg-white"
                ref={text_ref}
                contentEditable="true"
                onKeyDown={handleKeyDown}
            />
            <div title="items-container" className="max-w-[30rem] flex flex-wrap gap-4  border-1 border-dashed border-black p-4">
                { items.map((txt: string, idx: number) => (
                    <span
                        key={`text-item-#${idx}`}
                        title="item"
                        className="p-3 border-1 border-dashed border-blue"
                        onDoubleClick={()=>onDeleteItem(idx)}
                    >
                        {txt}
                    </span>
                ))}
            </div>
        </div>
    )
};

export default TextItems;
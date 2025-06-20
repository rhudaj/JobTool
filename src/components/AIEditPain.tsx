import { Button } from "@headlessui/react";
import { SingleItemDropArea } from "@/components/dnd/dropArea";
import { useEffect, useState } from "react";
import { StandaloneDragItem } from "@/components/dnd/BucketItem";
import { getBucketType } from "@/components/dnd/types";
import { useForm, Controller } from "react-hook-form"
import { Experience } from "@/lib/types";

interface AIEditItemParams {
    item: any,
    description?: string,
    job: string,
}

const ex_response = {
    "summary": "Dynamic software engineer with a strong focus on developing, testing, and deploying high-performance, scalable applications. Committed to leveraging innovative technologies to tackle complex challenges and enhance user experience. Proficient in:<br>",
    "languages": [
        "Python",
        "Java",
        "JavaScript",
        "Go",
        "C++",
        "C#",
        "HTML",
        "CSS"
    ],
    "technologies": [
        "Numpy/Pandas/PyTorch",
        "React",
        "GCP",
        "AWS",
        "Git",
        "Docker",
        "Microsoft Azure",
        "SQL Server",
        "PostgreSQL"
    ]
}

export function AIEditPane(props: {}) {

    const { register, control, setValue, handleSubmit, formState } = useForm<AIEditItemParams>();
    const [AIResponse, setAIResponse] = useState<any>(null);
    const [type, setType] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    useEffect(()=>console.log('type = ', type), [type])

    const onSubmit = async (data: AIEditItemParams) => {
        console.log("AI Editing. Params: ", data);
        try {
            const response = await fetch('/api/ai/edit-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log('AI Response: ', result);
            setAIResponse(result);
        } catch (error) {
            console.error('Error:', error);
            alert(error);
        }
    };

    const bt = type ? getBucketType(type) : null;

    return (
        <div className="grid grid-cols-[1fr_1fr]">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-2 border-1 p-2"
            >
                <label>Resume Item:</label>
                <Controller
                    name="item"
                    control={control}
                    render={({ field }) => (
                        <SingleItemDropArea id="ai-edit-item" onUpdate={S=>{
                            field.onChange(S.value)
                            setValue("description", `itemType=${S.type}, id=${S.id}`)
                            setType(S.type)
                            setId(S.id)
                        }}/>
                    )}
                />

                <label>Job Description:</label>
                <textarea
                    {...register("job", { required: true })}
                    className="border-1"
                />

                <Button
                    className="mt-4"
                    type="submit"
                    disabled={!formState.isValid}
                >
                    Go
                </Button>

            </form>
            <div title="ai-response" className="border-1 p-2">
                {AIResponse && id && type && bt &&
                    <StandaloneDragItem
                        item={{ id: `${id}-tailored`, value: AIResponse }}
                        item_type={type}
                    >
                        {bt?.DisplayItem?.({obj: AIResponse})}
                    </StandaloneDragItem>
                }
            </div>
        </div>
    );
}

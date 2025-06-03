import { useEffect, forwardRef, useImperativeHandle } from "react";
import { SubSection } from "@/components";
import { useImmer } from 'use-immer';
import TextEditDiv from '@/components/texteditdiv';

// TODO: fix the JobInfo interface in /shared.
interface JobInfo2 {
    name: string,
    type?: string,
    content?: any,
    headers?: string[]
}

const JIDisplay = forwardRef((
    props: { jobInfo?: JobInfo2[] },
    ref: React.ForwardedRef<any>
) => {
        const [JI, setJI] = useImmer<JobInfo2[]|null>(null);

        // Given new props, update local job info:
        useEffect(() => {
            setJI(props.jobInfo ?? [
                { name: "company" },
                { name: "positionName" },
                { name: "positionType" },
                { name: "dateRange" },
                { name: "salary" },
                { name: "deadline" },
                { name: "howToApply" },
                { name: "aboutCompany" },
                { name: "aboutRole" },
                { name: "aboutYou" },
                { name: "aboutTeam" },
                { name: "qualifications", headers: ["Type", "Description"] },
                { name: "languages" },
                { name: "technologies" },
            ]);
        }, [props.jobInfo]);

        // give the parent 'App' access to JI
        useImperativeHandle(ref, () => ({
            get() { return JI; }
        }));


        return (
            <div id="job-info-display">
                {
                    JI?.map((sec,i) => (
                        <SubSection
                            key={i}
                            id={`${sec.name}-section`}
                            heading={sec.name}
                        >
                            {
                                // DETERMINE THE COMPONENT FROM THE "type" PROPERTY
                                !sec.type || sec.type == "text" ? (
                                    <TextEditDiv className="ji-text-item" tv={sec?.content ?? "N/S"} onUpdate={newVal=>
                                        setJI(draft=>{
                                            if(draft) draft[i].content = newVal;
                                        })
                                    }/>
                                ) : null
                            }
                        </SubSection>
                    ))
                }
            </div>
        );
    }
);

export default JIDisplay;

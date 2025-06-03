
import { AssistantWrapper } from "./Assistant";

// DEFINE THE ASSISTANT

interface QuestionParams {
    item: any,
    description?: string,
    job: string
}

export const resumeItemAssistant = await AssistantWrapper.create<QuestionParams, any>(
    // Name:
    "edit_item",
    // Get Question Msg
    (p: QuestionParams) =>
        `Here is the job description:\n\n${p.job}\n\n` +
        `Here is the resume section (${p.description}):\n\n${JSON.stringify(p.item, null, 2)}`,
    // Get New Thread Msg
    (response: string) => JSON.parse(response),
)
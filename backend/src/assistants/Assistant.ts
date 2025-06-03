import { OpenAI } from "openai";
import * as Util from "./util.js";


/** NOTES
 * KEY COMPONENTS
 * --------------
 * @Thread
 * A conversation session between an Assistant and a user.
 * Threads store Messages and automatically handle truncation to fit content into a model’s context.
 * @Message
 * Created by an Assistant or a user.
 * Messages can include text, images, and other files. Messages stored as a list on the Thread.
 * @Run
 * Invocation of an Assistant on a Thread.
 * The Assistant uses its configuration and the Thread’s Messages to perform tasks by calling models and tools.
 * As part of a Run, the Assistant appends Messages to the Thread.

 * ------------------------------------------------------------------------------------------
 * BASIC STEPS
 * -----------
 * 1. Create/Retrieve an Assistant
 * 2. Create a Thread
 * 3. Add a Message to the Thread
 * 4. Create a Run
 *
 * ------------------------------------------------------------------------------------------
 * RUN STATUS
 * ----------
 * @completed
 * Can view all Messages the Assistant added to the Thread.
 * Can also continue the conversation (i.e. repeat steps 3,4)
 *
 * ------------------------------------------------------------------------------------------
 * ADVANCED NOTES
 * --------------
 * @RunSettings
 * * Limit Context:
 *      * By default, the Assistant will use all the content given to it (so far) for each run.
 *      * Set the MAX # completion tokens when creating the run (total # tokens used in all completions throughout the Run's lifecycle)
 *          * if the limit is reached, the result will be cut-off and `run.status` <-- 'incomplete'
 *      * Set the MAX # of recent messages you'd like to include in a run.
 * * Choose the model:
 *      * Will use the model on file by default.
 *
 */


export const AssistandIDs = {
    cl: "asst_kiS7Nbb0VeXRd1T8kraFE3JY",
    edit_item: "asst_TISZLkoiiYZLGNpQUeIdeEoi",
};

export class AssistantWrapper<Q, R=undefined> {

    // Private => can only be created by the factory method
    private constructor(
        private threadsClient: OpenAI.Beta.Threads,
        private id: string,
        private name: string,
        private getQuestion: (params: Q) => string,
        private formatResponse?: (response: string) => R,
    ) {
        console.log("(Connected) Assistant:\n" + [
            `name: ${name}`,
            `id: ${id}`,
        ].join('\n\t'));
    };

    /**
     * Factory method.
     * @returns a new `AssistantWrapper` object, IF it exists.
     * */
    static async create<Q, R=undefined>(
        name: keyof typeof AssistandIDs,
        getQuestion: (params: Q) => string,
        formatResponse?: (response: string) => R,
    ): Promise<AssistantWrapper<Q, R> | null> {
        // Ensure the assistant exists

        const id = AssistandIDs[name];
        const client = Util.getClient();
        const assistant = await client.beta.assistants.retrieve(id);

        if(!assistant) {
            console.error(`Could not find assistant with id `)
            return null;
        }

        return new AssistantWrapper(
            client.beta.threads,
            assistant.id,
            assistant.name,
            getQuestion,
            formatResponse
        )
    };

    async askQuestion(qp: Q): Promise<string|R> {

        console.log(`Asking ${this.name} a question. Params:\n`, qp);

        // setup the thread along with the 1/only user message
        const thread = await this.threadsClient.create({
            messages: [
                {
                    role: "user",
                    content: this.getQuestion(qp),
                }
            ]
        })

        // Invoking the Assistant on the Thread
        const run = await this.threadsClient.runs.createAndPoll(thread.id, {
            assistant_id: this.id,
        });

        console.log('Run Complete! status = ', run.status);

        // Extract the AI's response, based on the status

        let response = "";
        switch(run.status) {
            case "completed": {
                // successful runs that don't have structured outputs
                Util.getUsage(run.usage);
                // Retrieve the messages from the thread
                const messages = await this.threadsClient.messages.list(thread.id);
                console.log(`Found ${messages.data.length} in the thread`);
                // Find the latest assistant message
                const responseMsg = messages.data.find(msg => msg.role === "assistant");
                if (!responseMsg || responseMsg.content.length !== 1 || !responseMsg.content[0]?.['text']?.['value']) {
                    throw new Error("Unexpected response format. Expected a single text message.");
                }
                response = responseMsg.content[0]['text']['value'];
                break;
            }
            case "requires_action": {
                // requires extra work to extract
                response = Util.getStructuredResponse(run);
                break;
            }
            default: {
                throw new Error(`Unexpected run status: ${run.status}`);
            }
        }

        // format the response if specified
        return this.formatResponse ? this.formatResponse(response) : response;
    };
};
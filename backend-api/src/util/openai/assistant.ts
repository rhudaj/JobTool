import OpenAI from "openai";
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY}); // client

/** creating an Assistant
 * @overview Only requires specifying the model to use. But you can further customize the behavior of the Assistant:
 * @opt1 Use the instructions parameter to guide the personality of the Assistant and define its goals. Instructions are similar to system messages in the Chat Completions API.
 * @opt2 Use the tools parameter to give the Assistant access to up to 128 tools. You can give it access to OpenAI-hosted tools like code_interpreter and file_search, or call a third-party tools via a function calling.
 * @opt3 Use the tool_resources parameter to give the tools like code_interpreter and file_search access to files. Files are uploaded using the File upload endpoint and must have the purpose set to assistants to be used with this API.
 */
async function createNewAssistant(P: {
    name: string,
    description: string,
    model: string,
    fileName: string,
    response_function: any,
    instructions: string,
}): Promise<OpenAI.Beta.Assistants.Assistant> {

    // Setup File

        // const fileStream = fs.createReadStream(P.fileName);
        const fileStream: any = undefined;

        console.log('opened resume file, length = ', fileStream.readableLength);

        const file = await openai.files.create({
            file: fileStream,
            purpose: 'assistants'  // Specify 'assistants' to use this file for an AI assistant
        });

        console.log("Uploaded file ID:", file.id);

        // Creating a Vector Store:
        const vectorStore = await openai.beta.vectorStores.create({
            name: "Assistants-Files",
        });

        console.log("Vector Store ID:", vectorStore.id);

        await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStore.id, {
            file_ids: [file.id]
        });

        console.log("Files added to Vector Store:", vectorStore.id);

    // Create the Assistant with the code_interpreter tool enabled and provide the file as a resource to the tool.

    console.log('Creating the assistant.');

    const assistant = await openai.beta.assistants.create({
        name: P.name,
        description: P.description,
        model: P.model,
        tools: [
            {
                type: "file_search"
            },
            {
                type: "function",
                function: P.response_function
            }
        ],
        tool_resources: {
            file_search: {
                vector_store_ids: [vectorStore.id],
            }
        }
    });

    console.log('Created the assistant, id = ', assistant.id);

    return assistant;
};

async function listAssistants() {
    const assistants_page = await openai.beta.assistants.list();
    console.log('Assistants Page:\n', JSON.stringify(assistants_page));
};

/**
 * Create a thread with a message
 * @note Bad to have all messages in 1 thread. Can't focus on question at hand.
 * @param P
 */
async function askAssistant(P: {
    assistant_id: string,
    question: string
}) {
    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: "user",
                content: P.question
            }
        ]
    });

    console.log('thread created. ID =', thread.id);

    // Invoking the Assistant on the Thread; processes thread's messages & append new messages (responses)
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: P.assistant_id
    });

    console.log('run created and polled. Status = ', run.status);

    const result = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    console.log('Got Result. Completed @: ', result.completed_at);

    if(result.status == "requires_action") {
        console.log('requires action');
        console.log('Tool #0:\n\tid=', result.required_action.submit_tool_outputs.tool_calls[0].id, "\n\ttype=", result.required_action.submit_tool_outputs.tool_calls[0].type);
        // fetch json from function arguments
        let structured_response = JSON.parse(
            result.required_action.submit_tool_outputs.tool_calls[0].function.arguments
        );
        return structured_response;
    } else {
        console.log('action NOT required');
        return null;
    }
};

export { createNewAssistant, askAssistant, listAssistants }
import OpenAI from "openai";

export function getClient(): OpenAI {
    const key = process.env.OPENAI_API_KEY;
    if(!key) {
        throw new Error("No 'OPENAI_API_KEY' found in .env")
    }
    return new OpenAI({ apiKey: key });
};

/** creating an Assistant
 * @overview Only requires specifying the model to use. But you can further customize the behavior of the Assistant:
 * @opt1 Use the instructions parameter to guide the personality of the Assistant and define its goals. Instructions are similar to system messages in the Chat Completions API.
 * @opt2 Use the tools parameter to give the Assistant access to up to 128 tools. You can give it access to OpenAI-hosted tools like code_interpreter and file_search, or call a third-party tools via a function calling.
 * @opt3 Use the tool_resources parameter to give the tools like code_interpreter and file_search access to files. Files are uploaded using the File upload endpoint and must have the purpose set to assistants to be used with this API.
 */
export async function createNew(P: {
    name: string;
    description: string;
    model: string;
    fileName: string;
    response_function: any;
    instructions: string;
}): Promise<OpenAI.Beta.Assistants.Assistant> {

    // get client:
    const openai = getClient();

    if (!openai) {
        throw new Error("Could not connect with OpenAI client!");
    }

    // const fileStream = fs.createReadStream(P.fileName);
    const fileStream: any = undefined;

    console.log("opened resume file, length = ", fileStream.readableLength);

    const file = await openai.files.create({
        file: fileStream,
        purpose: "assistants", // Specify 'assistants' to use this file for an AI assistant
    });

    console.log("Uploaded file ID:", file.id);

    // Creating a Vector Store:
    const vectorStore = await openai.beta.vectorStores.create({
        name: "Assistants-Files",
    });

    console.log("Vector Store ID:", vectorStore.id);

    await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStore.id, {
        file_ids: [file.id],
    });

    console.log("Files added to Vector Store:", vectorStore.id);

    // Create the Assistant with the code_interpreter tool enabled and provide the file as a resource to the tool.

    console.log("Creating the assistant.");

    const assistant = await openai.beta.assistants.create({
        name: P.name,
        description: P.description,
        model: P.model,
        tools: [
            {
                type: "file_search",
            },
            {
                type: "function",
                function: P.response_function,
            },
        ],
        tool_resources: {
            file_search: {
                vector_store_ids: [vectorStore.id],
            },
        },
    });

    console.log("Created the assistant, id = ", assistant.id);

    return assistant;
}

export async function listAssistants() {
    const openai = getClient();
    const assistants_page = await openai.beta.assistants.list();
    console.log("Assistants Page:\n", JSON.stringify(assistants_page));
}

/** Get the total token usage from a thread run */
export const getUsage = (usage: OpenAI.Beta.Threads.Runs.Run.Usage) => {
    const totalTokens = usage.total_tokens;
    console.log(`total tokens used=${totalTokens}`)
    return totalTokens;
}

export function getStructuredResponse(
    run: OpenAI.Beta.Threads.Runs.Run,
    tool_idx: number = 0
): string {
    return run.required_action.submit_tool_outputs.tool_calls[tool_idx].function.arguments
}

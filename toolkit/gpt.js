/* eslint-disable valid-jsdoc */
const {Configuration, OpenAIApi} = require("openai");

const KEY = "YOUR_KEY";
const configuration = new Configuration({apiKey: KEY});
const openai = new OpenAIApi(configuration);

/**
 * It takes a prompt and some options, and returns the first completion from the GPT-4 API
 * @param prompt - The prompt to give to GPT-4.
 * @param [options] - {
 * @return The text of the first choice.
 */
async function callGPT4(options) {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{role: "user", content: options.prompt}],
        });
        return {
            data: {
                choices: [
                    {
                        text: completion.data.choices[0].message.content
                    }
                ]
            }
        };
    } catch (error) {
        console.error("Error calling GPT-4:", error);
        return null;
    }
}

/**
 * Join all the strings together.
 * @param strings - a list of strings
 * @returns the strings joined together.
 */
function joinStrings(strings) {
    return `${strings}`;
}

module.exports = callGPT4;

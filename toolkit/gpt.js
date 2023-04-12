/* eslint-disable valid-jsdoc */
const {Configuration, OpenAIApi} = require("openai");

const defaultConfig = require('../config.json');

/**
 * It takes a prompt and some options, and returns the first completion from the GPT-4 API
 * @param prompt - The prompt to give to GPT-4.
 * @param [options] - {
 * @return The text of the first choice.
 */
async function callGPT4(options) {
    const KEY = options.key;
    const configuration = new Configuration({apiKey: KEY});
    const openai = new OpenAIApi(configuration);

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

/**
 * The function returns the text of the first choice in the data object of a given GPT object.
 * @param GPT - The GPT parameter is likely an object that contains data from the OpenAI GPT
 * (Generative Pre-trained Transformer) language model. This function extracts the generated text
 * response from the GPT object and returns it.
 * @returns The function `getResponse` is returning the text of the first choice from the GPT data.
 */
function getResponse(GPT) {
    return GPT.data.choices[0].text;
}

module.exports = {
    callGPT4,
    getResponse
};

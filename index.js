/**
 * This function calls the GPT4 API with a given prompt and retries if it fails.
 * @param prompt - The `prompt` parameter is a string that represents the input text that will be
 * used as a prompt for the GPT-4 language model. The language model will generate a continuation
 * of the input text based on the provided prompt.
 * @returns The function `callGPT4WithRetry` returns the response from the `callGPT4` function
 * after retrying it if it fails due to an error.
 */
async function callGPT4WithRetry(prompt) {
  let response = null;

  while (response === null) {
      try {
          response = await callGPT4({prompt: prompt});
      } catch (err) {
          console.log("Failed, but trying again");
          await sleep(15000);
      }
  }

  return getResponse(response);
}

/**
 * Checks if a given character or sequence is in a string
 *
 * @param {string} str - The string to check for the character or sequence.
 * @param {string} charSequence - The character or sequence to search for in the string.
 * @return {boolean} True if the character or sequence is found in the string; False otherwise.
 */
function containsCharSequence(str, charSequence) {
  return str.includes(charSequence);
}

/**
* Validates the format of an array of packages.
*
* @param {Array} packages - The array of AI packages to validate.
* @return {Boolean} A boolean value indicating whether the format of the array is valid.
*/
function validatePackages(packages) {
  if (!Array.isArray(packages)) {
      return false;
  }

  for (const npm_package of packages) {
      if (typeof npm_package.name !== "string") {
          return false;
      }
      if (typeof npm_package.description !== "string") {
          return false;
      }
      if (!Array.isArray(npm_package.functions)) {
          return false;
      }
      for (const func of npm_package.functions) {
          if (typeof func.function_name !== "string") {
              return false;
          }
          if (typeof func.function_summary !== "string") {
              return false;
          }
      }
  }

  return true;
}

/**
* This function generates 20 ideas for useful npm packages for the AI dev community and returns them
* as a JSON array of objects with package name, description, and example functions.
* @returns The function `generateNPMPackageIdeas()` returns a JSON array of objects with information
* about 20 useful npm packages that could be built for the AI dev community, including the package
* name, description of what it does, and a list of example functions with their names and summaries.
*/
async function generateNPMPackageIdeas(idea) {
  console.log("🧠 Thinking of an idea...");
  const json_string = await callGPT4WithRetry(`
      Create a useful 1 npm package I could build for ${idea} community that doesn't exist.
      
      Respond with a JSON array of objects with 'name' of package, 'description' of what it does, and 'functions' which is a list of example functions in this page, with that they do, formatted in a object each with 'function_name', and 'function_summary'

      Only return ideas for packages that don't need external packages, models or APIs to work, and would be feasible with pure Javascript.

      If some of the example functions need to iterate through complex data, which isn't a basic string or array, generate an example of the data in 'example_data' within the object defining the function.
  `);

  try {
      const schema_array = JSON.parse(json_string);

      if (validatePackages(schema_array)) {
          for (const npm_schema of schema_array) {
              await createNPM(npm_schema);
          }
      } else {
          console.log("Couldn't validate packages");
      }
  } catch (err) {
      console.log("json broken af");
  }
}

generateNPMPackageIdeas("Mathematics trigonometry");

/**
* This function creates NPM packages by generating and exporting functions from a given schema.
* @param npm_schema - The `npm_schema` parameter is an object that contains information about an NPM
* package, including its name, description, and an array of function objects. Each function object
* represents a function that will be generated and exported as part of the NPM package. The
* `createNPM` function iterates
*/
async function createNPM(npm_schema) {
  for (const function_object of npm_schema.functions) {
      console.log(`👨🏻‍💻 Starting to work on ${npm_schema.name}`);
      await generateFunctionAndExport(function_object, {
          name: npm_schema.name,
          description: npm_schema.description
      });

      await sleep(2000);
  }
}

const FORMAT_RULES = `
  Only respond with the javascript code, and nothing else. 
  You may add comments to explain the code, but only do so in compliance with js-doc, and javscript commenting.
  Assume you're writing directly into the .js file, so don't include the triple backticks for markdown, just write raw JS.

  For example, don't use the backticks like \`\`\`. You are pipelining this response into a valid .js file, respond like:
  /**
   * Converts a list of strings into a single sentence with a custom separator.
   *
   * @param {string[]} stringList - The list of strings to convert.
   * @param {string} separator - The custom separator to use for joining strings.
   * @return {string} A single sentence made by joining the list of strings with the custom separator.
   */
  function joinStringsWithCustomSeparator(stringList, separator) {
      return stringList.join(separator);
  }
`;

const LINTING_RULES = `
  Rules:
  1. Strings must use doublequotes.
  2. Follow eslint best-practises for the code format
  3. Add a new line before the js-doc, after the function, and after the module export declaration
  4. In the JS-doc, include a commented example of how to use the function
  5. Use "const" wherever variables aren't re-assigned.
  6. Use parentheses around arrow function arguments
  7. Split 'let' declarations into multiple statements.
  8. Blocks must not be padded by blank lines
  9. Write valid JS-doc for each function, which includes:
      * a @param tag for each parameter in the function or method
      * use indentations of 4 spaces.
      * the order of parameter names in the JSDoc comment is consistent with the function or method
      * you include a @return or @returns tag for the return value of the function or method
      * you include a type for each parameter and return value in the JSDoc comment
      * you include a description for each parameter and return value in the JSDoc comment
      * there are no syntax errors in the JSDoc comment.
      * Use @return instead of @returns
  10. Trailing spaces not allowed.
`;

/**
* This function generates a Node.js function based on a desired task, verifies and tests the generated
* code, and exports it to a specified file.
* @param desiredTask - The desired task is a string that describes the task that the generated
* function should perform. For example, "calculate the sum of two numbers" or "sort an array of
* strings".
*/
async function generateFunctionAndExport(function_object, meta) {
  console.log(`🔮 Building function: ${function_object.function_name}, ${function_object.function_summary}`);
  const prompt = `
      Write a Node.js function called "${function_object.function_name}" that performs the following task: ${function_object.function_summary}.
      ${FORMAT_RULES}

      ${LINTING_RULES}

      After you write the function, using the function name, export it like this:
      function containsCharSequence(str, charSequence) {
          return str.includes(charSequence);
      }
      
      module.exports = containsCharSequence;
      module.exports.containsCharSequence = containsCharSequence;

  `;
  const generatedFunctionCode = await callGPT4WithRetry(prompt);

  if (!containsCharSequence(generatedFunctionCode, "```")) {
      // Verify and test the generatedFunctionCode before proceeding

      // Write the function
      console.log(`🙋🏻‍♂️ Writing function: ${function_object.function_name}()...`);
      const outputFile = `./factory/api/ai/${meta.name}.js`;

      writeTo(outputFile, generatedFunctionCode);

      // Write the test
      const test_prompt = `
          Write a test for this function using only pure Javascript, and no external packages other than the function your testing: 
          ${generatedFunctionCode}

          To access and use this function, require it like this (use the actual function name above, not functionName):
          const functionName = require("./${meta.name}").functionName;

          ${FORMAT_RULES}

          ${LINTING_RULES}

          After you write the test function, run it and console.log it to the console
      `;

      console.log(`👨🏻‍🔬 Generating & writing test function for ${function_object.function_name}()...`);
      const generatedTestCode = await callGPT4WithRetry(test_prompt);

      const testFile = `./factory/api/ai/${meta.name}-tests.js`;

      writeTo(testFile, generatedTestCode);
  }
}

/**
* Removes any occurrence of the string "```" followed by any characters from a string.
*
* @param {string} str - The input string.
* @return {string} The input string with any occurrence of the specified substring removed.
*/
function removeCodeBlock(str) {
  return str.replace(/```.*/g, "");
}

/**
* The function writes content to a file, either creating a new file or appending to an existing one.
* @param outputFile - The name and path of the file to write to.
* @param content - The content parameter is the data that needs to be written to the output file. It
* can be a string, buffer, or any other data type that can be written to a file.
*/
function writeTo(outputFile, content) {
  if (!fs.existsSync(outputFile)) {
      fs.writeFileSync(outputFile, "/* eslint-disable */ \n\n" + removeCodeBlock(content));
      fs.appendFileSync(outputFile, "\n\n");
  } else {
      fs.appendFileSync(outputFile, "/* eslint-disable */ \n\n" + removeCodeBlock(content));
      fs.appendFileSync(outputFile, "\n\n");
  }
}
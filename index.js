const fs = require("fs");
const path = require("path");
const { exec } = require('child_process');

const {
    callGPT4,
    getResponse
} = require("./toolkit/gpt");
const {
    FORMAT_RULES,
    LINTING_RULES
} = require("./toolkit/rules");

/**
 * Sleep() returns a promise that resolves after a given time.
 * @param waitTimeInMs - The time you want to delay, in milliseconds.
 */
const sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

/**
 * This function calls the GPT4 API with a given prompt and retries if it fails.
 * @param prompt - The `prompt` parameter is a string that represents the input text that will be
 * used as a prompt for the GPT-4 language model. The language model will generate a continuation
 * of the input text based on the provided prompt.
 * @returns The function `callGPT4WithRetry` returns the response from the `callGPT4` function
 * after retrying it if it fails due to an error.
 */
async function callGPT4WithRetry(prompt, config) {
    let response = null;

    while (response === null) {
        try {
            response = await callGPT4({
                prompt: prompt,
                key: config.GPT_KEY,
                model: config.GPT_MODEL
            });
        } catch (error) {
            console.log("Failed, but trying again" + error);
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
        console.log("if (!Array.isArray(packages)) {")
        return false;
    }

    for (const npm_package of packages) {
        if (typeof npm_package.name !== "string") {
            console.log(`if (typeof npm_package.name !== "string") {`)
            return false;
        }
        if (typeof npm_package.description !== "string") {
            console.log(`if (typeof npm_package.description !== "string") {`);
            return false;
        }
        if (!Array.isArray(npm_package.functions)) {
            console.log(`if (!Array.isArray(npm_package.functions)) {`);
            return false;
        }
        for (const func of npm_package.functions) {
            if (typeof func.function_name !== "string") {
                console.log(`if (typeof func.function_name !== "string") {`);
                return false;
            }
            if (typeof func.function_summary !== "string") {
                console.log(`if (typeof func.function_summary !== "string") {`);
                return false;
            }
        }
    }

    return true;
}

const DEFAULT_IDEA = {
    prompt: "node.js string manipulation toolkit",
    number_of_functions: 10,
    name_prefix: "hero"
};

/**
 * This function generates 20 ideas for useful npm packages for the AI dev community and returns them
 * as a JSON array of objects with package name, description, and example functions.
 * @returns The function `generateNPMPackageIdeas()` returns a JSON array of objects with information
 * about 20 useful npm packages that could be built for the AI dev community, including the package
 * name, description of what it does, and a list of example functions with their names and summaries.
 */
async function generateNPMPackageIdeas(config, idea = DEFAULT_IDEA) {
    console.log("🧠 Thinking of an idea...");
    const json_string = await callGPT4WithRetry(`
      Create 1 useful npm package I could build for ${idea.prompt}.
      
      Respond with a JSON array of objects with 'name' of package, 'description' of what it does, and 'functions' which is a list of ${idea.number_of_functions} functions in this package, with that they do, formatted in a object each with 'function_name', and 'function_summary'

      In the "function_summary", elaborate on different test case, what extreme cases to handle, and which to ignore. Be very specific, and give examples.

      Only return ideas for packages that don't need external packages, models or APIs to work, and would be feasible with pure Javascript.

      Give the npm package 'name' this prefix: ${idea.name_prefix}, 
      Example: ${idea.name_prefix}-tools, ${idea.name_prefix}-trigonometry, etc.
  `, config);

    try {
        const schema_array = JSON.parse(json_string);
        console.log("✅ Is Valid JSON... Continuing to Key Checker...");

        if (validatePackages(schema_array)) {
            console.log("✅ Validated... Continuing to builder...");
            
            for (const npm_schema of schema_array) {
                console.log(schema_array);

                try {
                    fs.writeFileSync(`./schemas/${npm_schema.name}.json`, JSON.stringify({
                        packages: schema_array
                    }), null, 4);
                } catch (err) {
                    console.log("From Write file");
                    console.log(err);
                }

                const dir = npm_schema.name;

                console.log("⚡️ Writing README.md...");
                const readMeMarkdown = await callGPT4WithRetry(`
                    Can you write a README.md in Markdown, for the following npm package.

                    I've formatted it as a JSON for readability: ${JSON.stringify(npm_schema)}

                    Add this to the end of every file, to display my socials, and where I work:
                    [${config.AUTHOR_NAME}](${config.AUTHOR_URL}), at [${config.AUTHOR_ORG_NAME}](${config.AUTHOR_ORG_URL})
                `, config);

                writeTo(`./hero_modules/${dir}/README.md`, `
_This entire repository was created completely with **AI**, using the [hero-ai-package-creator](https://github.com/hero-page/hero-ai-package-creator), which is **open-source**, uses **GPT-4**, and is written & maintained by [**Sam Chahine**](https://hero.page/samir)_ ❣️🧞‍♀️ \n\n

${readMeMarkdown}
                `, true);
                
                console.log("⚡️ Writing package.json...");

                const packageJSONPrompt = await callGPT4WithRetry(`
                    Can you write a package.json for the following npm package: ${json_string}

                    I've formatted it as a JSON for readability: ${json_string}

                    The name of the package is "@hero-page/${npm_schema.name}"
                    The description is ${npm_schema.description}
                    The author is Sam Chahine
                    The version is 1.0.0
                    The main entry is "index.js"
                    For The keywords, generate them from the above schema
                    The license is MIT
                    Leave repository empty for now
                    It has no dependencies

                    Only respond with the JSON. No comments, no explanations, on the JSON Object with its keys and values.
                `, config);

                writeTo(`./hero_modules/${dir}/package.json`, packageJSONPrompt, true);
                
                await createNPM(npm_schema, dir, config);

                postScripts(config);
            }
        } else {
            console.log("Couldn't validate packages");
        }
    } catch (err) {
        console.log("json broken af"); // You can add a withRetry for this, but I didn't want to, personally xo
        console.log(err);
        console.log(json_string)
    }
}

/**
 * This function creates NPM packages by generating and exporting functions from a given schema.
 * @param npm_schema - The `npm_schema` parameter is an object that contains information about an NPM
 * package, including its name, description, and an array of function objects. Each function object
 * represents a function that will be generated and exported as part of the NPM package. The
 * `createNPM` function iterates
 */
async function createNPM(npm_schema, dir, config) {
    for (const function_object of npm_schema.functions) {
        console.log(`👨🏻‍💻 Starting to work on ${npm_schema.name}`);
        await generateFunctionAndExport(function_object, {
            name: npm_schema.name,
            description: npm_schema.description
        }, dir, config);

        await sleep(2000);
    }
}

/**
 * This function generates a Node.js function based on a desired task, verifies and tests the generated
 * code, and exports it to a specified file.
 * @param desiredTask - The desired task is a string that describes the task that the generated
 * function should perform. For example, "calculate the sum of two numbers" or "sort an array of
 * strings".
 */
async function generateFunctionAndExport(function_object, meta, dir, config) {
    console.log(`🔮 Building function: ${function_object.function_name}, ${function_object.function_summary}`);
    const prompt = `
      Write a Node.js function called "${function_object.function_name}" that performs the following task: ${function_object.function_summary}.
      ${FORMAT_RULES}

      ${LINTING_RULES}

      After you write the function, using the function name, export it like this:
      function containsCharSequence(str, charSequence) {
          return str.includes(charSequence);
      }

      module.exports = {
        containsCharSequence
      };

      DON'T call the function, I will be using it as an export module later.
      DON'T use while loops. However, utilize for loops however you please.
      Make sure to handle EVERY possible test case, so you don't fail any code tests.
  `;
    const generatedFunctionCode = await callGPT4WithRetry(prompt, config);

    if (!containsCharSequence(generatedFunctionCode, "```")) {
        // Verify and test the generatedFunctionCode before proceeding

        // Write the function
        console.log(`🙋🏻‍♂️ Writing function: ${function_object.function_name}()...`);
        const outputFile = `./hero_modules/${dir}/functions/${function_object.function_name}.js`;

        writeTo(outputFile, generatedFunctionCode);

        // Write the test
        const test_prompt = `
          Write a test for this function using only pure Javascript, and no external packages: 
          ${generatedFunctionCode}

          ${FORMAT_RULES}

          ${LINTING_RULES}

          After you write the function, using the function name, export it like this:
          function testContainsCharSequence() {
              // ... test function here
          }
          
          module.exports = {
            testContainsCharSequence
          };

          Don't require the function you're testing, it will already be in the same file, so you can safely call it.
          DON'T call the test function, I will be using it as an export module later.
          When you're writing this test function, don't have any passable parameters, and keep all values contained within the function.

          Only test for cases mentioned as valid cases in the following description: ${function_object.function_summary}

          Instead of using console.log to yield the results of the tests, set two variables within the test function: 1. "number_of_tests_passed", and 2. "number_of_tests_failed".
          Also, set a variable for a string of the name of the function you're testing, in "name_of_function"

          When a test fails, increment "number_of_tests_failed" by 1.
          When a test passes, increment "number_of_tests_passed" by 1

          At the end of the test function, call the function "addToReadme(generateTestBadge(name_of_function, number_of_tests_passed, number_of_tests_failed))".

          Don't write the function definitions for addToReadme OR generateTestBadge, they will already be in the file, you can safely access them. You also already have access to "fs", so don't require/import that either.

          Wrap each test case with a try { } catch (err) { }, but don't throw an error if it fails, just increment "number_of_tests_failed", if it passes, that's when you increment "number_of_tests_passed"
      `;

        console.log(`👨🏻‍🔬 Generating & writing test function for ${function_object.function_name}()...`);
        const generatedTestCode = await callGPT4WithRetry(test_prompt, config);

        const testFile = `./hero_modules/${dir}/tests/${function_object.function_name}.js`;

        writeTo(testFile, `
        const {${function_object.function_name}} = require("../functions/${function_object.function_name}"); 
        \n\n
        ` + 'const fs = require("fs"); \n\n' 
        + "function generateImageBadgeURL(label, value, passed) {\n return `https://img.shields.io/badge/${encodeURIComponent(label)}-${value}-${passed === 0 ? '13b285' : 'ff69b4'}`;}\n\n"
        + "function generateTestBadge(functionName, numberOfPassed, numberOfFailed) {\n const url = generateImageBadgeURL(functionName + '()', encodeURIComponent(numberOfPassed + ' passed, ' + numberOfFailed + ' failed.'), numberOfFailed);\n\n return '\\n\\n### Tests for ' + functionName + '\\n\\n' + '![' + functionName + '](' + url + ')';}\n\n"
        + "function addToReadme(str) {fs.appendFile('./README.md', str, function (err) {if (err) throw err;console.log('String added to the file');});}"
        + generatedTestCode);
    }
}

/**
 * The function extracts the description from a JSDoc comment in JavaScript code.
 * @param jsCode - The JavaScript code that contains the JSDoc comment.
 * @returns a string that represents the description of a JSDoc comment in a given JavaScript code. If
 * there is no JSDoc comment in the code, an empty string is returned.
 */
function getJSDocDescription(jsCode) {
    const jsDocComment = jsCode.match(/\/\*\*([\s\S]+?)\*\//);
    if (!jsDocComment) {
        return '';
    }
    const jsDocLines = jsDocComment[0].split('\n');
    let description = '';
    for (let i = 1; i < jsDocLines.length; i++) {
        const line = jsDocLines[i].trim();
        if (!line.startsWith('* @')) {
            description += line.replace(/^\*\s?/, '') + ' ';
        } else {
            break;
        }
    }
    return description.trim();
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
 * Get the directory from a file path string.
 *
 * @param {string} filePath - The file path string.
 * @return {string} The directory of the file path.
 */
function getDirectoryFromFilePath(filePath) {
    return path.dirname(filePath);
}

/**
 * The function writes content to a file, either creating a new file or appending to an existing one.
 * @param outputFile - The name and path of the file to write to.
 * @param content - The content parameter is the data that needs to be written to the output file. It
 * can be a string, buffer, or any other data type that can be written to a file.
 */
function writeTo(outputFile, content, isMarkdown = false) {
    const dirPath = getDirectoryFromFilePath(outputFile);

    if (!fs.existsSync(dirPath)) {
        console.log(`👨🏻‍💻🗂️ Directory doesn't exist, creating it...`);
        fs.mkdirSync(dirPath, {
            recursive: true
        });
    }

    if (!fs.existsSync(outputFile)) {
        fs.writeFileSync(outputFile, !isMarkdown ? "/* eslint-disable */ \n\n" + removeCodeBlock(content) : content);
    } else {
        fs.appendFileSync(outputFile, "\n\n" + (!isMarkdown ? removeCodeBlock(content) : content) + "\n\n");    
    }
}

async function generateNPMPackageIdeasWithRetry(config, idea) {
    let success = false;

    while (!success) {
        try {
            await generateNPMPackageIdeas(config, idea);
            success = true;
        } catch (error) {
            console.error(`Failed to generate NPM package ideas for ${idea}. Retrying...`);
        }
    }
}

// Post scripts
async function postScripts(config) {
    const directories = getDirectories('./hero_modules');

    for (const dir of directories) {
        const full_path = `./hero_modules/${dir}`;
        generateIndexFile(full_path);
        generateTestsFile(full_path);
        modifyPackageJson(full_path);
    }

    runTestsInDirectories(directories, config);
}

function getDirectories(dirPath) {
    return fs.readdirSync(dirPath).filter((file) => {
        return fs.statSync(path.join(dirPath, file)).isDirectory();
    });
}

function generateIndexFile(directory) {
    // Get all the function filenames in the functions directory
    const functionsDirectory = path.join(directory, "functions");
    const functionFiles = fs.readdirSync(functionsDirectory);

    // Get the names of the functions from the filenames
    const functionNames = functionFiles.map(file => file.split(".")[0]);

    // Generate the exports string for the index file
    const exportsString = functionNames.map(name => `exports.${name} = require('./functions/${name}');`).join("\n");

    // Write the exports string to the index file
    fs.writeFileSync(path.join(directory, "index.js"), exportsString);
}

function generateTestsFile(directory) {
    // Get all the test filenames in the tests directory
    const testsDirectory = path.join(directory, "tests");
    const testFiles = fs.readdirSync(testsDirectory);

    // Get the names of the tests from the filenames
    const testRequireStatements = testFiles.map(file => {
        const pathToTest = `./${path.join(testsDirectory, file)}`;
        console.log(pathToTest);
        const testModule = fs.readFileSync(pathToTest, "utf-8");
        const strippedModule = testModule.replace(/\b\w+\(\);/g, '');
        fs.writeFileSync(pathToTest, strippedModule);
        const testKeys = Object.keys(require(pathToTest));
        const testKey = testKeys[0];
        return `const {${testKey}} = require('./tests/${file}');`;
    }).join("\n");

    // Write the tests to the tests.js file
    fs.writeFileSync(path.join(directory, "tests.js"), `${testRequireStatements}\n\n`);
}

function generateTestsFile(directory) {
    // Get all the test filenames in the tests directory
    const testsDirectory = path.join(directory, "tests");
    const testFiles = fs.readdirSync(testsDirectory);

    // Get the names of the tests from the filenames
    const testRequireStatements = testFiles.map(file => {
        const relativePathToTest = `./${path.join("tests", file)}`;
        console.log(relativePathToTest);
        const testModule = require(path.join(process.cwd(), testsDirectory, file)); // Update this line
        const testKeys = Object.keys(testModule);
        const testKey = testKeys[0];
        return `const {${testKey}} = require('${relativePathToTest}');`;
    }).join("\n");

    // Generate the test calls for the tests
    const testCalls = testFiles.map(file => {
        const testModule = require(path.join(process.cwd(), testsDirectory, file)); // Update this line
        const testKeys = Object.keys(testModule);
        const testKey = testKeys[0];
        return `${testKey}();`;
    }).join("\n");

    // Write the tests to the tests.js file
    fs.writeFileSync(path.join(directory, "tests.js"), `${testRequireStatements}\n\n${testCalls}`);
}

function modifyPackageJson(directory) {
    const packageJsonPath = path.join(directory, "package.json");
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath));

    // Ensure packageJson has a scripts property
    if (!packageJson.scripts) {
        packageJson.scripts = {};
    }

    packageJson.scripts.test = "node tests.js";

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function getDescriptionFromPackageJson(dir) {
    try {
      const data = fs.readFileSync(`./hero_modules/${dir}/package.json`, 'utf8');
      const packageJson = JSON.parse(data);
      return packageJson.description || '';
    } catch (err) {
      console.error(`Error reading package.json: ${err}`);
      return '';
    }
}
  

function runTestsInDirectories(directories, config) {
    let index = 0;
  
    function executeNextTest() {
      if (index >= directories.length) {
        return;
      }
  
      const dir = directories[index];
      index++;
  
      const testCommand = [
        `cd ./hero_modules/${dir}`,
        'npm run test',
        'cd ../../'
      ].join(' && ');
  
      exec(testCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`Test results for ${dir}:`);
        console.log(stdout);
        console.error(stderr);

        const desc = getDescriptionFromPackageJson(dir);
  
        // Create GitHub repo
        const ghCreateRepoCommand = `gh api -i graphql -f query='
        mutation {
          createRepository(input: {name: "${dir}", description: "${desc}", homepageUrl: "${config.AUTHOR_ORG_URL}", visibility: ${config.REPO_VISIBILITY}, ownerId: "${config.GITHUB_OWNER_ID}"}) {
            repository {
              url
            }
          }
        }'`;
  
        exec(ghCreateRepoCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`GitHub repo created for ${dir}:`);
          console.log(stdout);
          console.error(stderr);
  
          // Push the directory to the new GitHub repo
          const gitCommands = [
            'git init',
            'git add .',
            `git commit -m "Publish ${dir}"`,
            'git branch -M main',
            `git remote add origin https://github.com/${config.GITHUB_USERNAME}/${dir}.git`,
            'git push -u origin main',
            'cd ../../'
          ].join(' && ');
  
          exec(`cd ./hero_modules/${dir} && ${gitCommands}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`Directory ${dir} pushed to GitHub:`);
            console.log(stdout);
            console.error(stderr);

            // Move the directory from ./hero_modules to ./published_hero_modules
            exec(`mv ./hero_modules/${dir} ./published_hero_modules/${dir}`, (error, stdout, stderr) => {
                if (error) {
                console.error(`exec error: ${error}`);
                return;
                }
                console.log(`Moved ${dir} from ./hero_modules to ./published_hero_modules`);
                console.log(stdout);
                console.error(stderr);

                // cd into ./published_hero_modules/${dir} and run `npm publish --access public`
                exec(`cd ./published_hero_modules/${dir} ${config.SHOULD_PUBLISH_TO_NPM ? "&& npm publish --access public" : ""} && cd ../..`, (error, stdout, stderr) => {
                    if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                    }
                    console.log(`Published ${dir} to npm with public access:`);
                    console.log(stdout);
                    console.error(stderr);

                    // Run the next test
                    executeNextTest();
                });
            });
          });
        });
      });
    }
  
    // Start executing tests
    executeNextTest();
  }
  
/**
 * 
 * 
 * Playground 😊 
 * These are some example "ideas", feel free to change the values as you please.
 * More than likely, these packages will be in the main repo (https://github.com/hero-page/hero-ai-package-creator)
 * under ./published_hero_modules
 * 
 * 
 */

const default_ideas = [
    {
        prompt: "A set of functions for working with regular expressions, such as finding and replacing text patterns and validating user input",
        number_of_functions: 6,
        name_prefix: "hero-ai"
    }
]

async function creator(options) {
    if (
        options.config === null || options.config === undefined ||
        options.ideas === null || options.ideas === undefined || options.ideas.length === 0
    ) {
        throw new Error('🚨 Oops! 🚨 Both config and ideas parameters must be defined! 🤖');
        return;
    } else {
        const directories = ["./schemas", "./hero_modules", "./published_hero_modules"]

        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        }

        for (const idea of options.ideas) {
            await generateNPMPackageIdeasWithRetry(options.config, idea);
        }        
    }

}

module.exports = {
    creator
};
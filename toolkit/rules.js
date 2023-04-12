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
  11. Don't import or require any packages, write everything in Pure Javascript
  12. All functions must be written in camelCase format
`;

module.exports = {
    FORMAT_RULES,
    LINTING_RULES
};

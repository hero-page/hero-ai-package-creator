# hero-ai-package-creator

Hi! I'm [Sam Chahine](https://hero.page/samir), and I'm pretty obsessed with pushing AI to its limits. It's like a tiny magic realm from whence I can extract wisdom from masters past... oh, it's just like a [book](https://chahinearchives.com/). Anyway!

## Table of Contents

- [Author Comment](#comment)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Schema](#schema)
- [Contributing](#contributing)
- [License](#license)

## Comment
So to use this package, you'll need an API key for [GPT4](https://openai.com/waitlist/gpt-4-api). I'm not sure when the waitlist format will end, and everyone will gain access. But till then, I'm happy to create any AI packages you recommend 😊

If you wanna chat, I'm on [Twitter](https://twitter.com/HeroMeers), [LinkedIn](https://www.linkedin.com/in/meersc/), [Hero](https://hero.page/samir) (most of my work is on Hero)

Here are some packages I've created & published so far: 
1. [hero-emoji-strings](https://github.com/hero-page/hero-emoji-strings)
2. [hero-ai-built-regex-utilities](https://github.com/hero-page/hero-ai-built-regex-utilities)
3. [hero-regex](https://github.com/hero-page/hero-regex)
4. [hero-date-time-utils](https://github.com/hero-page/hero-date-time-utils)
5. [hero-math-functions](https://github.com/hero-page/hero-math-functions)
6. [hero-array-utils](https://github.com/hero-page/hero-array-utils)
7. [hero-string-manipulation](https://github.com/hero-page/hero-string-manipulation)

Each AI-created package takes anywhere between 10-20 minutes, depending on how many functions you want the package to have.

Here's a non-techy visual of which prompts were used to create this magical creator:
1. [Prompts](https://hero.page/samir/prompts-for-hero-ai-package-creator/prompts)
2. [Format & Linting Rules for Code Output from GPT](https://hero.page/samir/prompts-for-hero-ai-package-creator/function-writing-prompt-rules)

#### Silly Errors from AI
I've seen that _sometimes_, AI is over-confident in its ability to write proper regex, and ends up corrupting a file.

Worst case scenario is the script will catch this & stop (everything is tested at the end automatically), and you could either decided to fix the function yourself, or create another "simpler" package. Up to you!

## Installation

```bash
npm install @hero-page/hero-ai-package-creator
```

It has 2 dependencies (which have their own dependencies):
1. [openai](https://www.npmjs.com/package/openai)
2. [jsdoc](https://www.npmjs.com/package/jsdoc)

They will _probably_ be installed since they're in the `package.json`, just wanted to be transparent 😊

## Usage

```javascript
const {creator} = require("@hero-page/hero-ai-package-creator");

const config = {
    "AUTHOR_NAME": "Sam Chahine",
    "AUTHOR_URL": "https://github.com/kingmeers",
    "AUTHOR_ORG_NAME": "Hero",
    "AUTHOR_ORG_URL": "https://hero.page",
    "GITHUB_USERNAME": "hero-page",
    "GITHUB_OWNER_ID": "YOUR_GITHUB_OWNER_ID",
    "REPO_VISIBILITY": "PUBLIC",
    "REPO_PREFIX": "hero",
    "SHOULD_PUBLISH_TO_NPM": false,
    "GPT_MODEL": "gpt-4", // Can be any model for which you have access
    "GPT_KEY": "GPT-KEY" // Must be a key that corresponds to above model's access
};

const ideas = [
    {
        prompt: "A set of functions for string manipulating emojis",
        number_of_functions: 12,
        name_prefix: "hero"
    }
]


creator({
    config,
    ideas
});
```

## Configuration

You can customize the behavior of this package by providing a configuration object when initializing it. The available configuration options are described below, along with their default values:

```json
{
  "AUTHOR_NAME": "Sam Chahine",
  "AUTHOR_URL": "https://github.com/kingmeers",
  "AUTHOR_ORG_NAME": "Hero",
  "AUTHOR_ORG_URL": "https://hero.page",
  "GITHUB_USERNAME": "hero-page",
  "GITHUB_OWNER_ID": "YOUR_GITHUB_OWNER_ID",
  "REPO_VISIBILITY": "PUBLIC",
  "REPO_PREFIX": "hero",
  "SHOULD_PUBLISH_TO_NPM": false,
  "GPT_MODEL": "gpt-4", // Can be any model for which you have access
  "GPT_KEY": "GPT-KEY"
}
```

To obtain your GitHub owner ID, follow these steps:

1. Install the `gh` CLI tool: `brew install gh`
2. Log in to your GitHub account: `gh auth login`
3. Run the following command, replacing "YOUR_GITHUB_USERNAME/ORG" with your actual GitHub username or organization name: `gh api graphql -f query='{ organization(login:"YOUR_GITHUB_USERNAME/ORG") { id } }'`
4. Replace "YOUR_GITHUB_OWNER_ID" with the owner ID obtained from the query.

## Schema
The type of Schema this package currently creates & uses is quite simple, it looks like this:
```json
{
   "packages":[
      {
         "name":"hero-emoji-strings",
         "description":"A library to manage strings with emojis, making it easier to manipulate, count and sanitize strings that contain emojis",
         "functions":[
            {
               "function_name":"emojiCount",
               "function_summary":"Counts the number of emojis in a given string. Handles Unicode and shortcodes emojis. Test cases: single emojis, strings with no emojis, strings with mixed emojis, and long strings with emojis. Extreme cases: strings with special characters, strings with a mixture of letters, numbers, and emojis. Ignored cases: malformed shortcodes."
            },
            {
               "function_name":"replaceEmoji",
               "function_summary":"Replaces all occurrences of a specific emoji in a string with another string (could be another emoji). Test cases: strings with single emoji, multiple emojis, and mixed character types. Extreme cases: large strings and special characters. Ignored cases: invalid input emoji."
            },
            {
               "function_name":"splitByEmoji",
               "function_summary":"Splits a string into an array of strings divided by emojis. Test cases: single emojis, strings with no emojis, strings with mixed emojis, and strings with various delimiters. Extreme cases: strings with special characters and long strings with emojis. Ignored cases: malformed shortcodes."
            },
         ]
      }
   ]
}
```

It is generated with GPT4, and then fed back into GPT4 one by one, for further elaboration, function writing & tests too!

The purpose of this experiment is more research than anything. I have a visual output of the tests passed/failed, and some pass with flying colors, while others fail some.

What's interesting, is that GPT4 writes better tests than it does error-handling-functions! 

### Explore Schemas
If you want to see more schemas without having to run any GPT4, you can find several examples in the `./schemas` folder.

I've also uploaded several packages under `./published_hero_modules` incase you just want to browse!

## Contributing

Contributions and issues are welcome. However, please note that I may have limited time to fix issues and review contributions. Your help is appreciated!


## License

This project is licensed under the MIT License.
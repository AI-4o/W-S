#!/usr/bin/env ts-node
import axios from "axios";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { execActionsChain, trim } from "./utils/helpers";
import { isDomElementData } from "./models";

// Define the base URL of your server
const BASE_URL = `http://localhost:3000`;
// Function to navigate to a URL
async function navigate(url: string) {
  try {
    console.log(`Base URL: ${BASE_URL}`);
    const response = await axios.post(`${BASE_URL}/navigate`, { url });
    console.log(response.data);
  } catch (error: any) {
    console.error(
      `Error navigating to ${url}:`,
      error.response?.data || error.message
    );
  }
}
/**
 * Function to click an element
 * usage -> npm run click "button[id = "W0wltc"]"
 *  */
async function click(selector: string) {
  try {
    const response = await axios.post(`${BASE_URL}/click`, { selector });
    console.log(response.data);
  } catch (error: any) {
    console.error(
      `Error clicking ${selector}:`,
      error.response?.data || error.message
    );
  }
}
/**
 * Function to type into an element
 * usage -> npm run type "#search-input" "OpenAI GPT-4"
 *  */
async function type(selector: string, text: string) {
  try {
    console.log("client, type", selector, text);

    await axios.post(`${BASE_URL}/type`, { selector, text });
  } catch (error: any) {
    console.error(
      `Error typing into ${selector}:`,
      error.response?.data || error.message
    );
  }
}
/**
 * Function to evaluate a script
 * 
 * examples:
 * 1. npm run evaluate "document.querySelector('h1').innerText"
 * 2. npm run evaluate "document.querySelectorAll('p')"
 * 
 * @param script - The script to evaluate
 */
async function evaluate(script: string) {
  try {
    const response = await axios.post(`${BASE_URL}/evaluate`, { script });
    return response.data.result;
  } catch (error: any) {
    console.error(
      `Error evaluating script:`,
      error.response?.data || error.message
    );
  }
}
/**
 * Function to scrape the data of an HTMLElement from a selector,
 * or the data of an array of HTMLElements from the array of the corresponding selectors
 * 
 * the output has its textContent field already trimmed.
 * 
 * examples: 
 * 1. npm run scrape ".t-16.t-black.t-bold" -> returns data of a single element
 * 2. npm run scrape ".t-16, p, span" -> returns array of data of three elements
 * 
 * @param selector - The selector of the element to scrape the data from
 * @param selectors - The array of selectors of the elements to scrape the data from
 * @returns The data of the element or the array of data of the elements
 */
async function scrapeQSelector(selector?: string, selectors?: string[]) {
  if (selector) {
    const data = await evaluate(`document.querySelector('${selector}')`);
    if(isDomElementData(data)) {
      return {
        ...data,
        textContent: trim(data?.textContent),
      };
    }
    return data;
  }
  if (selectors) {
    const data: any[] = [];
    await execActionsChain({
      actions: selectors.map((selector) => {
        return async () => data.push(await scrapeQSelector(selector));
      }),
      delay: 300,
    });
    return data;
  }
}
/**
 * Function to scrape the data of an array of HTMLElements from a selector
 * 
 * @param selector - The selector of the elements to scrape the data from
 * @returns The array of data of the elements
 */
async function scrapeQSelectorAll(selector: string) {
  const data =  await evaluate(`document.querySelectorAll('${selector}')`);
  if(Array.isArray(data)) {
    return data.map((d) => {
      if(isDomElementData(d)) {
        return { ...d, textContent: trim(d?.textContent) };
      }
      return d;
    });
  }
  return data;
}
/**
 * Function to get page content
 * usage -> npm run content
 */
async function getContent() {
  try {
    const response = await axios.get(`${BASE_URL}/content`);
    console.log("Page content:", response.data);
  } catch (error: any) {
    console.error(
      `Error getting content:`,
      error.response?.data || error.message
    );
  }
}
/**
 * Function to shutdown the server
 * usage -> npm run shutdown
 */
async function shutdown() {
  try {
    const response = await axios.post(`${BASE_URL}/shutdown`);
    console.log(response.data);
  } catch (error: any) {
    console.error(
      `Error shutting down server:`,
      error.response?.data || error.message
    );
  }
}
/**
 * Function to simulate pressing Enter
 * usage -> npm run pressEnter
 */
async function pressEnter() {
  try {
    const response = await axios.post(`${BASE_URL}/pressEnter`);
    console.log(response.data);
  } catch (error: any) {
    console.error(
      `Error pressing Enter:`,
      error.response?.data || error.message
    );
  }
}
// define command-line arguments to call the functions using yargs
/**
  example of usage from terminal:
  ./client.ts navigate https://example.com
  ./client.ts click 'a.some-link'   
  ./client.ts type '#search-input' 'Puppeteer'
  ./client.ts evaluate ??
  ./client.ts content
  ./client.ts shutdown
*/
yargs(hideBin(process.argv))
  .command(
    "navigate <url>",
    "Navigate to a URL",
    (yargs) => {
      return yargs.positional("url", {
        describe: "The URL to navigate to",
        type: "string",
      });
    },
    async (argv) => {
      await navigate(argv.url as string);
    }
  )
  .command(
    "click <selector>",
    "Click an element by selector",
    (yargs) => {
      return yargs.positional("selector", {
        describe: "The selector of the element to click",
        type: "string",
      });
    },
    async (argv) => {
      await click(argv.selector as string);
    }
  )
  .command(
    "type <selector> <text>",
    "Type text into an element",
    (yargs) => {
      return yargs
        .positional("selector", {
          describe: "The selector of the element to type into",
          type: "string",
        })
        .positional("text", {
          describe: "The text to type",
          type: "string",
        });
    },
    async (argv) => {
      await type(argv.selector as string, argv.text as string);
    }
  )
  .command(
    "evaluate <script>",
    "Evaluate a script in the page context",
    (yargs) => {
      return yargs.positional("script", {
        describe: "The script to evaluate",
        type: "string",
      });
    },
    async (argv) => {
      await evaluate(argv.script as string);
    }
  )
  .command(
    "content",
    "Get the current page content",
    () => {},
    async () => {
      await getContent();
    }
  )
  .command(
    "shutdown",
    "Shutdown the server",
    () => {},
    async () => {
      await shutdown();
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

export {
  navigate,
  click,
  type,
  evaluate,
  scrapeQSelector,
  scrapeQSelectorAll,
  getContent,
  shutdown,
  pressEnter,
};

#!/usr/bin/env ts-node
import axios from "axios";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

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
    console.log('client, type', selector, text);
    
    await axios.post(`${BASE_URL}/type`, { selector, text });
  } catch (error: any) {
    console.error(
      `Error typing into ${selector}:`,
      error.response?.data || error.message
    );
  }
}
// Function to evaluate a script
async function evaluate(script: string) {
  try {
    const response = await axios.post(`${BASE_URL}/evaluate`, { script });
    console.log("Evaluation result:", response.data.result);
  } catch (error: any) {
    console.error(
      `Error evaluating script:`,
      error.response?.data || error.message
    );
  }
}
// Function to get page content
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
// Function to shutdown the server
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
// Simulate pressing Enter
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

export { navigate, click, type, evaluate, getContent, shutdown, pressEnter };
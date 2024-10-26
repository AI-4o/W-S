import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { click, evaluate, type, getContent, navigate, shutdown } from "../../client";
import puppeteer, { Page } from "puppeteer";

// This file contains functions to navigate on any website

const linkedInEmail = 'alfredo.ingraldo.u@gmail.com'
const linkedInPassword = 'zyon2021'








// define command-line arguments to call the functions using yargs
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
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Cl from "../../client";
// This file contains functions to navigate on any website

const scrapeData = async (selectors: string[]) => {
  return await Cl.scrapeData('',selectors);
};

// define command-line arguments to call the functions using yargs
yargs(hideBin(process.argv))
  .command(
    "scrape <selectors>", // comma separated selectors of the form "selector1, selector2, ..., selectorN"
    "Scrape the contact info from the linkedin contact page",
    (yargs) => {
      yargs.positional("selectors", {
        type: "string",
        describe: "The selectors to scrape the contact info from, comma separated",
        coerce: (arg) => arg.split(", "), // Convert comma-separated string to array
      });
    },
    async (argv) => {
      await scrapeData(argv.selectors as string[]);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

export { scrapeData };
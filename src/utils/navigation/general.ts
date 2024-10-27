import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Cl from "../../client";
import type { DomElementData } from "../../models";

// This file contains functions to navigate on any website

/**
 * Scrape data from the page using querySelector on a list of selectors
 * @param selectors - comma separated selectors of the form "selector1, selector2, ..., selectorN"
 * @returns an array of data objects corresponfing to the selected HTMLElements returned by querySelector
 */
const scrapeQSelector = async (selectors: string[]) => {
  const data =  await Cl.scrapeQSelector('',selectors);
  console.log("the scraped data: ", data.map((d: any) => d.textContent));
  return data;
}
/**
 * Scrape data from the page using querySelectorAll on a single selector
 * @param selector - the selector to scrape the data from
 * @returns an array of data objects corresponfing to the selected HTMLElements returned by querySelectorAll
 */
const scrapeQSelectorAll = async (selector: string) => {
  const data = await Cl.scrapeQSelectorAll(selector);

  console.log(
    'is data an array of data objects?: ', Array.isArray(data),
    'is data[0] of type DomELementData?: ', typeof data[0] === 'object',
    "the scraped data textContent: ", data.map((d: any) => d.textContent));
  return data;
};
// define command-line arguments to call the functions using yargs
yargs(hideBin(process.argv))
  .command(
    "scrape <selectors>", // comma separated selectors of the form "selector1, selector2, ..., selectorN"
    "Scrape data from the page",
    (yargs) => {
      yargs.positional("selectors", {
        type: "string",
        describe: "The selectors to scrape the contact info from, comma separated",
        coerce: (arg) => arg.split(", "), // Convert comma-separated string to array
      });
    },
    async (argv) => {
      await scrapeQSelector(argv.selectors as string[]);
    }
  )
  .command(
    "scrape-all <selector>",
    "Scrape data from the page using querySelectorAll on a single selector",
    (yargs) => {
      yargs.positional("selector", {
        type: "string",
        describe: "The selector to scrape the data from",
      });
    },
    async (argv) => {
      await scrapeQSelectorAll(argv.selector as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

export { scrapeQSelector, scrapeQSelectorAll };

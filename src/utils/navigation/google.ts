import * as Cl from "../../client";
import * as H from "../helpers";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// This file contains functions to navigate on google.com

/**
 * Open the chrome page of given pageUrl using puppeteer, and return the page object.
 * @param pageUrl
 * @returns Promise<Page>
 */
const googleUrl = "https://www.google.com";
const goToGoogle = async () => {
  return await Cl.navigate(googleUrl);
};
/**
 * Reject all google cookies in the google.com page.
 */
const rejectGoogleCookies = async () => {
  await Cl.click("button[id='W0wltc']");
};
/**
 * Search for a query on google.
 * @param query The query to search for
 */
const searchGoogle = async (query: string) => {
  console.log('searchGoogle, query: ', query);
  await H.execActionsChain({
    actions: [
      () => Cl.type('textarea[name="q"]', query),
      () => Cl.click("input[name='btnK']")
    ],
    delays: [1000, 1000]
  });
};
/**
 * Click the first search result on google.
 */
const clickFirstGoogleSearchResult = async () => {
  await Cl.click("h3");
};
/**
 * Perform a google search and click the first result. 
 * This function is a chain of actions that are executed sequentially, the actions are:
 * - Go to google.com
 * - Reject all google cookies
 * - Search for the given query
 * - Click the first search result
 * @param query The query to search for
 */
export const performGoogleSearch = async (query: string) => {
  await H.execActionsChain({
    actions: [
      goToGoogle,
      rejectGoogleCookies,
      () => searchGoogle(query),
      clickFirstGoogleSearchResult
    ],
    delays: [1000, 1000, 1000, 1000]
  });
};

yargs(hideBin(process.argv))
  .command(
    "perform-google-search <query>",
    "Search for a query on google and click the first result",
    (yargs) => {
      yargs.positional("query", {
        type: "string",
        describe: "The query to search for"
      });
    },
    async (argv) => {
      await performGoogleSearch(argv.query as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();
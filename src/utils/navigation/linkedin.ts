// This file contains functions to navigate on linkedin.com

import * as Cl from "../../client";
import * as H from "../helpers";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { scrapeQSelector, scrapeQSelectorAll } from "./general";

// This file contains functions to navigate on google.com

/**
 * Open the chrome page of given pageUrl using puppeteer, and return the page object.
 * @param pageUrl
 * @returns Promise<Page>
 */
const linkedinUrl = "https://www.linkedin.com";
const linkedinEmail = "alfredo.ingraldo.u@gmail.com";
const linkedinPassword = "Zyon2021";

const dataSelectorsMap = {
  profileKeywords: ".WgMsxIjLbnvOSeVhCjwqivuZXVVrfYHdHI > :nth-child(2)",
  location: ".WgMsxIjLbnvOSeVhCjwqivuZXVVrfYHdHI:nth-of-type(2) > :first-child",
  companyName: ".jYYwgfPGDaFLUjAkzWHOwxwPMWxLRYiNCt:first-of-type",

};

const goToLinkedin = async () => {
  return await Cl.navigate(linkedinUrl);
};
/**
 * Search for a contact by name in the linkedin search bar,
 * and open the contact page.
 * In particular, the following actioins are performed:
 * - click on the search button
 * - clear the search input
 * - type the contact name in the search input
 * - press enter
 * - click on the contact profile image
 * 
 * @param contactName The name of the contact to search for
 */
const searchContact = async (contactName: string) => {
  await H.execActionsChain({
    actions: [
      () => Cl.click("button.search-global-typeahead__collapsed-search-button"),
      () => Cl.clearInput("input.search-global-typeahead__input"),
      () => Cl.type("input.search-global-typeahead__input", contactName),
      () => Cl.pressEnter(),
      () => Cl.click(".presence-entity__image")
    ],
    delay: 500,
  });
};

const scrapeContactData = async (contactName: string) => {
  let data: any[] = [];
  await H.execActionsChain({
    actions: [
      () => searchContact(contactName),
      async () => data = await scrapeQSelector(Object.values(dataSelectorsMap)),
    ],
    delay: 1000,
  });
  return data;
};
/**
 * @param query The query to search for
 */
const performLinkedinLogin = async (username: string, password: string) => {
  /**
   * Reject all google cookies in the google.com page.
   */
  const rejectLinkedinCookies = async () => {
    await Cl.click("button[action-type='DENY']");
  };
  const clickSignInWithEmailButton = async () => {
    await Cl.click("a[href='https://www.linkedin.com/login']");
  };
  const typeLoginDataAndSubmit = async (username: string, password: string) => {
    await H.execActionsChain({
      actions: [
        () => Cl.type("input#username", username),
        () => Cl.type("input#password", password),
        () => Cl.click("button[type='submit']"),
      ],
      delays: [200, 200, 300],
    });
  };
  await H.execActionsChain({
    actions: [
      goToLinkedin,
      rejectLinkedinCookies,
      clickSignInWithEmailButton,
      () => typeLoginDataAndSubmit(username, password),
    ],
    delay: 500,
  });
};

yargs(hideBin(process.argv))
  .command(
    "perform-linkedin-login",
    "Login to linkedin",
    (yargs) => {},
    async (argv) => {
      await performLinkedinLogin(linkedinEmail, linkedinPassword);
    }
  )
  .command(
    "search-contact <contactName>",
    "Search for a contact by name in the linkedin search bar",
    (yargs) => {
      yargs.positional("contactName", {
        type: "string",
        describe: "The name of the contact to search for",
      });
    },
    async (argv) => {
      await searchContact(argv.contactName as string);
    }
  )
  .command(
    "scrape-contact-data <contactName>", // comma separated selectors of the form "selector1, selector2, ..., selectorN"
    "Scrape the contact info from the linkedin contact page",
    (yargs) => {
      yargs.positional("contactName", {
        type: "string",
        describe: "The name of the contact to scrape the info from",
      });
    },
    async (argv) => {
      await scrapeContactData(argv.contactName as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

// This file contains functions to navigate on linkedin.com

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
const linkedinUrl = "https://www.linkedin.com";
const linkedinEmail = 'alfredo.ingraldo.u@gmail.com';
const linkedinPassword = 'Zyon2021';

const goToLinkedin = async () => {
  return await Cl.navigate(linkedinUrl);
};
/**
 * Reject all google cookies in the google.com page.
 */
const rejectLinkedinCookies = async () => {
  await Cl.click("button[action-type='DENY']");
};

const clickSignInWithEmailButton = async () => {
  await Cl.click("a[href='https://www.linkedin.com/login']");
};
/**
 * Search for a contact by name in the linkedin search bar.
 * @param contactName The name of the contact to search for
 */
const searchContact = async (contactName: string) => {
    await H.execActionsChain({
        actions: [
            () => Cl.click("button.search-global-typeahead__collapsed-search-button"),
            () => Cl.type("input.search-global-typeahead__input", contactName),
            () => Cl.pressEnter(),
            () => Cl.click(".presence-entity__image"),
            () => scrapeContactInfo()
        ],
        delay: 500
    });
}
const scrapeContactInfo = async (selector: string) => {
    const contactInfo = await Cl.evaluate(`document.querySelector('${selector}')`);
    console.log(contactInfo);
}
const typeLoginDataAndSubmit = async (username: string, password: string) => {
  await H.execActionsChain({
    actions: [
      () => Cl.type("input#username", username),
      () => Cl.type("input#password", password),
      () => Cl.click("button[type='submit']")
    ],
    delays: [1000, 1000, 1000]
  });
};
/**
 * @param query The query to search for
 */
export const performLinkedinLogin = async (username: string, password: string) => {
  await H.execActionsChain({
    actions: [
      goToLinkedin,
      rejectLinkedinCookies,
      clickSignInWithEmailButton,
      () => typeLoginDataAndSubmit(username, password)
    ],
    delays: [1000, 1000, 1000, 1000]
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
            describe: "The name of the contact to search for"
        });
    },
    async (argv) => {
      await searchContact(argv.contactName as string);
    }
  )
  .command(
    "scrape <selector>",
    "Scrape the contact info from the linkedin contact page",
    (yargs) => {
      yargs.positional("selector", {
        type: "string",
        describe: "The selector to scrape the contact info from"
      });
    },
    async (argv) => {
      await scrapeContactInfo(argv.selector as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();
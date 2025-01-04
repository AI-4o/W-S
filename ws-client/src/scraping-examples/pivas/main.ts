import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as Cl from "../../client";
import { scrapeQSelectorAll } from "../../utils/navigation/general";
import { scrapeFromString } from "./scrape";

const fs = require("fs");
/**
 * Resets to false the field 'done' for all the pivas in the piva.json file.
 */
const resetPivaJson = () => {
  const pivas = fs.readFileSync("./piva.json", "utf8");
  const json = JSON.parse(pivas) as { piva: string; done: boolean }[];
  for (const piva of json) {
    piva.done = false;
  }
  console.log('piva.json after reset: ', json);
  fs.writeFileSync("./piva.json", JSON.stringify(json), "utf8");
};

/**
 * Scrape the data from the ufficioCamerale or the companyReports page for the given pivas.
 * 
 * 1. The pivas to scrape are read from the piva.json file, filtering out the ones already scraped (done: true).
 * 2. For each piva, scrape the data from the ufficioCamerale or, in case of failure, from the companyReports page.
 * 3. If the data is successfully scraped, update the piva.json file setting done: true for the corresponding piva, 
 *    and append the data to the pivasScrapedData.json file.
 */
export const scrapePIVAS = async () => {
  const pivas = fs.readFileSync("./piva.json", "utf8");
  const pivasArray = JSON.parse(pivas)
    .filter((x: { done: boolean }) => !x.done)
    .map((x: { id: number; piva: string }) => x.piva);
  for (const piva of pivasArray) {
    console.log(`\n\n\nSTARTING SCRAPING FOR ${piva}...\n\n\n`);
    const companyReportsActions = [
      () => Cl.navigate("https://www.companyreports.it/"),
      () => Cl.click("button[title='Cerca']"),
      () =>
        Cl.evaluate(`document.querySelector('#cercaPartitaIva').value = ''`), // clear input
      () => Cl.type('#cercaPartitaIva', piva),
      () => Cl.click("input[value='CERCA']"),
      () => Cl.click("div .content-azienda-nome a"),
      async () => await scrapeQSelectorAll("div#content>div>div>div>div:nth-of-type(2)>div>div")
    ];
    let success = await scrapeFromString(piva, companyReportsActions);
    if (!success) {
      const ufficioCameraleActions = [
        () => Cl.navigate("https://www.ufficiocamerale.it/"),
        () =>
          Cl.evaluate(`document.querySelector('input#search_input').value = ''`), // clear input
        () => Cl.type("input#search_input", piva),
        () => Cl.click('button[type="submit"]'),
        () => Cl.click("p.collapsedata a"),
        async () => await scrapeQSelectorAll("ul.list-group")
      ];
      success = await scrapeFromString(piva, ufficioCameraleActions);
    }
    if(success) checkDonePivaJson(piva);
  }
  console.log('\n\n\nSCRAPING ENDED\n\n\n');
};
/**
 * Set the field "done" to true for the piva in the piva.json file corresponding to the given _piva.
 * @param _piva 
 */
const checkDonePivaJson = (_piva: string) => {
  const pivas = fs.readFileSync("./piva.json", "utf8");
  const json = JSON.parse(pivas) as { piva: string; done: boolean }[];
  for (const piva of json) {
    if(piva.piva == _piva) {
      piva.done = true;
      console.log(`${piva.piva} checked done`);
      fs.writeFileSync("./piva.json", JSON.stringify(json), "utf8");
      return true;
    }
  }
  console.log(`${_piva} not found in piva.json`);
  return false;
}


yargs(hideBin(process.argv))
  .command(
    "scrape-pivas",
    "Scrape the data from the ufficioCamerale or the companyReports page",
    async () => {
      await scrapePIVAS();
    }
  )
  .command(
    "reset-piva-json",
    "Resets the field done to false for all the pivas in the piva.json file",
    async () => {
      resetPivaJson();
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

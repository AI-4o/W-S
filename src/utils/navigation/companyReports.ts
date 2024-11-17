// This file contains functions to navigate on linkedin.com

import * as Cl from "../../client";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { repeatedAttack, scrapeQSelectorAll } from "./general";
import { ScrapingError } from "../errors";
import { log } from "console";
import { createJsonFromFilteredData, filterData } from "../scrapingTools";

// This file contains functions to navigate on google.com

export const scrapePIVACompanyReports = async (piva: string) => {
  let data: any[] = [];
  try {
    data = await searchPIVA(piva);
    console.log("data: ", data);
    const filteredData = filterData(
      data, 
      piva, 
      ["ateco", "fatturato", "utile", "dipendenti"], 
      ["cod. ateco", "dipendenti", "acquista bilancio"]
    );
    console.log("the filtered data: ", filteredData);
    createJsonFromFilteredData(filteredData);
    return true;
  }
  catch(e: any) {
    console.error(e.message);
    return false;
  }
};
/**
 * 1. Navigate to the ufficioCamerale page
 * 2. Clear the search input
 * 3. Type the piva in the search input
 * 4. Click the search button
 * 5. Click the more info button
 * 6. Scrape the data from the ulDataSelector
 *
 * @param piva The piva of the company to search for
 */
const searchPIVA = async (piva: string) => {
  let data: any[] = [];
  const companyReportsUrl = "https://www.companyreports.it/";
  const pivaSearchButton = "button[title='Cerca']";
  const pivaSearchInput = '#cercaPartitaIva';
  const cercaButton = "input[value='CERCA']";
  const pivaLinkSelector = "div .content-azienda-nome a";
  const ulDataSelector = "ul.list-group";
  const contentSelector = "#mainContent";
  const dataCellsSelector = "div#content>div>div>div>div:nth-of-type(2)>div>div";
  let actionsChain = [
    () => Cl.navigate(companyReportsUrl),
    () => Cl.click(pivaSearchButton),
    () =>
      Cl.evaluate(`document.querySelector('${pivaSearchInput}').value = ''`), // clear input
    () => Cl.type(pivaSearchInput, piva),
    () => Cl.click(cercaButton),
    () => Cl.click(pivaLinkSelector),
    async () => (data = await scrapeQSelectorAll(dataCellsSelector))
  ];
  await repeatedAttack(actionsChain);
  if(data.length === 0) throw new ScrapingError("Action Chain Execution retrieved no data!");
  console.log("retrieved data after actionsChain: ", data);
  return data;
};

yargs(hideBin(process.argv))
  .command(
    "scrape-piva-company-reports <piva>",
    "Scrape the data from the companyReports page",
    (yargs) => {
      yargs.positional("piva", {
        describe: "The piva of the company to search for",
        type: "string",
      });
    },
    async (argv) => {
      await scrapePIVACompanyReports(argv.piva as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

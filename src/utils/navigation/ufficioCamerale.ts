import * as Cl from "../../client";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { repeatedAttack, scrapeQSelectorAll } from "./general";
import { ScrapingError } from "../errors";
import { createJsonFromFilteredData, filterData } from "../scrapingTools";

export const scrapePIVAUfficioCamerale = async (piva: string) => {
  let data: any[] = [];
  try {
    data = await searchPIVA(piva);
    console.log("the data: ", data);
    const filteredData = filterData(data, piva);
    console.log("the filtered data: ", filteredData);
    createJsonFromFilteredData(filteredData);
    return true;
  }
  catch(e: any) {
    console.error(e.message);
    return false;
  }
};
const searchPIVA = async (piva: string) => {
  let data: any[] = [];
  const ufficioCameraleUrl = "https://www.ufficiocamerale.it/";
  const pivaSearchInputSelector = "input#search_input";
  const pivaSearchButtonSelector = 'button[type="submit"]';
  const moreInfoButtonSelector = "p.collapsedata a";
  const ulDataSelector = "ul.list-group";
  let actionsChain = [
    () => Cl.navigate(ufficioCameraleUrl),
    () =>
      Cl.evaluate(`document.querySelector('input#search_input').value = ''`), // clear input
    () => Cl.type(pivaSearchInputSelector, piva),
    () => Cl.click(pivaSearchButtonSelector),
    () => Cl.click(moreInfoButtonSelector),
    async () => (data = await scrapeQSelectorAll(ulDataSelector)),
  ];
  await repeatedAttack(actionsChain);
  if(data.length === 0) throw new ScrapingError("Action Chain Execution retrieved no data!");
  return data;
}

yargs(hideBin(process.argv))
  .command(
    "scrape-piva-ufficio-camerale <piva>",
    "Scrape the data from the ufficioCamerale page",
    (yargs) => {
      yargs.positional("piva", {
        describe: "The piva of the company to search for",
        type: "string",
      });
    },
    async (argv) => {
      await scrapePIVAUfficioCamerale(argv.piva as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

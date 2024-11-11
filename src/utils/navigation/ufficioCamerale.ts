// This file contains functions to navigate on linkedin.com

import * as Cl from "../../client";
import * as H from "../helpers";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { scrapeQSelectorAll } from "./general";

// This file contains functions to navigate on google.com

/**
 * Open the chrome page of given pageUrl using puppeteer, and return the page object.
 * @param pageUrl
 * @returns Promise<Page>
 */
const ufficioCameraleUrl = "https://www.ufficiocamerale.it/";
const _piva = "01355000132";
const pivaSearchInputSelector = "input#search_input";
const pivaSearchButtonSelector = 'button[type="submit"]';
const moreInfoButtonSelector = "p.collapsedata a";
const ulDataSelector = "ul.list-group";

const goToUfficioCamerale = async () => {
  return await Cl.navigate(ufficioCameraleUrl);
};
/**
 * Search for a company by piva in the ufficioCamerale search bar.
 *
 * @param piva The piva of the company to search for
 */
const searchPIVA = async (piva: string) => {
  await H.execActionsChain({
    actions: [
      () => goToUfficioCamerale(),
      () =>
        Cl.evaluate(`document.querySelector('input#search_input').value = ''`), // clear input
      () => Cl.type(pivaSearchInputSelector, piva),
      () => Cl.click(pivaSearchButtonSelector),
    ],
    delay: 0,
  });
};
const clickMoreInfoButton = async (piva?: string) => {
  await Cl.waitForSelector(moreInfoButtonSelector)
    .then(() => Cl.click(moreInfoButtonSelector)) // click on the more info button
    .catch(() => {
      console.log("No more info button found, repeating searchPIVA...");
      searchPIVA(piva ?? _piva);
    });
};

const scrapePIVA = async (piva?: string) => {
  let data: any[] = [];
  await H.execActionsChain({
    actions: [
      () => searchPIVA(piva ?? _piva), // search for the piva
      () => clickMoreInfoButton(piva ?? _piva),
      async () => (data = await scrapeQSelectorAll(ulDataSelector)),
    ],
    delay: 0,
  });
  data.splice(2);
  data = data
    .map((item) => item.textContent)
    .flat()
    .map((item) => item.split(":"))
    .flat();
  const filteredData = filterData(data);
  createJsonFromFilteredData(filteredData);
};
export const createJsonFromFilteredData = (
  data: { [key: string]: string }
) => {
  const fs = require("fs");
  const outputPath = "./scrapedData.json";
  let jsonData: 
  { data: { [key: string]: string }[] } = { data: [] };

  // Check if the file exists
  if (fs.existsSync(outputPath)) {
    // Read the existing data
    const existingData = fs.readFileSync(outputPath, "utf8");
    try {
      jsonData = JSON.parse(existingData);
      console.log("Existing data:", jsonData);
      
    } catch (error) {
      console.error("Error parsing existing JSON data:", error);
    }
  }

  // Append the new data to the array
  jsonData.data.push(data);

  // Write the updated data back to the file
  fs.writeFileSync(outputPath, JSON.stringify(jsonData), "utf8");
  console.log("Data has been appended to scrapedData.json");
  return jsonData;
};

export const filterData = (
  data: string[]
): { [key: string]: string } => {
  const firstNotNull = (_i: number, arr: string[]) =>
    arr.find((x, i) => !!x && i > _i);

  const targetWords = ["ateco", "fatturato", "utile", "dipendenti"];
  const evil = "cod. ateco";
  const _filteredData = data
    .reverse()
    .map((item, _i) => {
      if (!item) return null;
      // find the first previous not null element
      const keywordSuperstring = firstNotNull(_i, data);
      // check if such element contains one of the keywords
      if (keywordSuperstring) {
        let keyword = "";
        const isTargetValue = targetWords.some((word) => {
          if (
            keywordSuperstring.toLowerCase().includes(word) &&
            !keywordSuperstring.toLowerCase().includes(evil)
          ) {
            keyword = word;
            return true;
          }
          return false;
        });
        // if the element contains one of the keywords, return the keyword and the value
        if (isTargetValue) {
          item = item.toLowerCase().replace(evil, "").trim();
          return { keyword: keyword, value: item };
        }
      }
      return null;
    })
    .filter((item, _i) => {
      return !!item?.keyword;
    }) as { keyword: string; value: string }[];
  // add piva to the filtered data
  _filteredData.push({
    keyword: "piva",
    value: _piva.toString(),
  });
  const filteredData = _filteredData.reduce((acc, curr) => {
    acc[curr.keyword] = curr.value;
    return acc;
  }, {} as { [key: string]: string });

  return filteredData;
};

yargs(hideBin(process.argv))
  .command(
    "scrape-piva <piva>",
    "Scrape the data from the ufficioCamerale page",
    (yargs) => {
      yargs.positional("piva", {
        type: "string",
        describe: "The piva of the company to scrape the data from",
      });
    },
    async (argv) => {
      await scrapePIVA(argv.piva as string);
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

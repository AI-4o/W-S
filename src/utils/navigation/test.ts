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

const startScraping = async () => {
    const fs = require("fs");
    const pivas = fs.readFileSync("./piva.json", "utf8");
    const pivasArray = JSON.parse(pivas);
    const piva = pivasArray[1].piva;
    const data = await searchPIVA(piva);
    addDataIntoJson(data, piva);
}

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
export const searchPIVA = async (piva: string) => {
  let data: any[] = [];
  const ufficioCameraleUrl = "https://www.ufficiocamerale.it/";
  const pivaSearchInputSelector = "input#search_input";
  const pivaSearchButtonSelector = 'button[type="submit"]';
  const moreInfoButtonSelector = "p.collapsedata a";
  const ulDataSelector = "ul.list-group";
  await H.execActionsChain({
    actions: [
      () => Cl.navigate(ufficioCameraleUrl),
      () =>
        Cl.evaluate(`document.querySelector('input#search_input').value = ''`), // clear input
      () => Cl.type(pivaSearchInputSelector, piva),
      () => Cl.click(pivaSearchButtonSelector),
      () => Cl.click(moreInfoButtonSelector),
      async () => (data = await scrapeQSelectorAll(ulDataSelector)),
    ],
    delay: 0,
  });
  return data;
};
/** Add the retrieved data into the json file */
export const addDataIntoJson = (data: any[], piva: string) => {
  const filteredData = filterData(data, piva);
  createJsonFromFilteredData(filteredData);
};
/**
 * Add the filtered data to a json file.
 * @param data The filtered data
 * @param outputPath The path of the json file
 */
export const createJsonFromFilteredData = (
  data: { [key: string]: string },
  outputPath: string = "./scrapedData.json"
) => {
  const fs = require("fs");
  let jsonData: { data: { [key: string]: string }[] } = { data: [] };

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
/**
 * Get an object with the required couples key-value
 * from the scraped data array.
 */
export const filterData = (
  data: any[],
  piva: string
): { [key: string]: string } => {
  const firstNotNull = (_i: number, arr: string[]) =>
    arr.find((x, i) => !!x && i > _i);

  data.splice(2);
  data = data
    .map((item) => item.textContent)
    .flat()
    .map((item) => item.split(":"))
    .flat() as string[];

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
    value: piva,
  });
  const filteredData = _filteredData.reduce((acc, curr) => {
    acc[curr.keyword] = curr.value;
    return acc;
  }, {} as { [key: string]: string });

  return filteredData;
};

yargs(hideBin(process.argv))
  .command(
    "scrapep",
    "Scrape the data from the ufficioCamerale page",
    () => {},
    async () => {
      await startScraping();
    }
  )
  .help()
  .alias("help", "h")
  .parse();
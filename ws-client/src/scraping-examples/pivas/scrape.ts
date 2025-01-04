import { updateJsonFromFilteredData, filterData } from "../../utils/scrapingTools";
import { repeatedAttack } from "../../utils/helpers";

/**
 * Scrape the data for the given piva the given actions chain, filter the data and update the json file.
 * @param piva 
 * @param actionsChain 
 * @returns boolean -> success/failure of scraping
 */
export const scrapeFromString = async (piva: string, actionsChain: (() => Promise<void>)[]) => {
  let data: any[] = [];
  let result = false;
  console.log(`starting repeated attack for ${piva}`);
  
  try {
    data = await repeatedAttack(actionsChain);
    console.log("\nretrieved data: ", data);
    const filteredData = filterData(
      data, 
      piva, 
      ["ateco", "fatturato", "utile", "dipendenti"], 
      ["cod. ateco", "dipendenti", "acquista bilancio"]
    );
    console.log("\nthe filtered data: ", filteredData);
    updateJsonFromFilteredData(filteredData, "./pivasScrapedData.json");
    // if filteredData contains other keys than 'piva'
    if(Object.keys(filteredData).length > 1) result = true;
    return result;
  }
  catch(e: any) {
    console.error('scrapeFromString of "', piva, '" failed: ', e.message);
    return false;
  }
};
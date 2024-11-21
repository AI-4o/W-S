// This file contains functions to navigate on linkedin.com

import { updateJsonFromFilteredData, filterData } from "../../utils/scrapingTools";
import { repeatedAttack } from "../../utils/helpers";

/**
 * 
 * @param piva 
 * @param actionsChain 
 * @returns 
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
    updateJsonFromFilteredData(filteredData);
    // if filteredData contains other keys than 'piva'
    if(Object.keys(filteredData).length > 1) result = true;
    return result;
  }
  catch(e: any) {
    console.error('scrapeFromString of "', piva, '" failed: ', e.message);
    return false;
  }
};
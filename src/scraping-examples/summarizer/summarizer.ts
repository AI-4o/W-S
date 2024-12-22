/**
 * this object summarizes the content of the articles of the given url
 */

import { getContents as getMilanoFContents } from "./summarizer.milano-finanza";
import { getContents as getAnsaContents } from "./summarizer.ansa-economia";
import { getContents as getFortuneItaContents } from "./summarizer.fortune-ita";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";

enum URLS {
    ECONOMY_MILANO_FINANZA = "news/economia",
    TECH_MILANO_FINANZA = "news/tecnologia",
    ECONOMY_ANSA = "https://www.ansa.it/sito/notizie/economia/economia.shtml?refresh_ce"
}
const summarize = async (i: number) => {
    switch (i) {
        case 1:
            await getMilanoFContents(URLS.ECONOMY_MILANO_FINANZA);
            break;
        case 2:
            await getMilanoFContents(URLS.TECH_MILANO_FINANZA);
            break;
        case 3:
            await getAnsaContents();
            break;
        case 4:
            await getFortuneItaContents();
            break;  
    }
}


yargs(hideBin(process.argv))
  .command(
    "summarize-milano-finanza",
    "Scrape the data from the given url",
    () => {},
    async () => {
      await summarize(1);
    }
  )
  .command(
    "summarize-milano-tech",
    "Scrape the data from the given url",
    () => {},
    async () => {
      await summarize(2);
    }
  )
  .command(
    "summarize-ansa",
    "Scrape the data from the given url",
    () => {},
    async () => {
      await summarize(3);
    }
  )
  .command(
    "summarize-fortune-ita",
    "Scrape the data from the given url",
    () => {},
    async () => {
      await summarize(4);
    }
  )
  .parse();
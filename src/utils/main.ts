import yargs from "yargs";
import { scrapePIVAUfficioCamerale} from "./navigation/ufficioCamerale";
import { hideBin } from "yargs/helpers";
import { scrapePIVACompanyReports } from "./navigation/companyReports";

export const scrapePIVA = async () => {
    const fs = require("fs");
    const pivas = fs.readFileSync("./piva.json", "utf8");
    const pivasArray = JSON.parse(pivas);
    for(const piva of pivasArray) {
      const success = await scrapePIVACompanyReports(piva);
      if(!success) {
        await scrapePIVAUfficioCamerale(piva);
      }
    }
  };

  yargs(hideBin(process.argv))
  .command(
    "scrape-piva-general",
    "Scrape the data from the ufficioCamerale or the companyReports page",
    () => {},
    async () => {
      await scrapePIVA();
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

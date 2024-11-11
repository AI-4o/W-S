import yargs from "yargs";
import { execActionsChain, executeOCR, takeScreenshot } from "./helpers";
import { concatActions } from "./helpers";
import { createJsonFromFilteredData, filterData } from "./navigation/ufficioCamerale";
import { hideBin } from "yargs/helpers";

// test the concatActions helper function
const concatActionsTestArg = {
  actions: [
    () => console.log("action 1 -> logging the following: ", "mario"),
    () => {
      console.log("action 2: I return 'mario'");
      return "mario";
    },
    (x: any) => console.log("action 2.1: I log what i get...: ", x),
    () => console.log("action 3 -> logging the following: ", "carlo"),
  ],
  delays: [1000, 1000, 1000, 1000],
};
const testConcatActions = async () => {
  const result = await concatActions(concatActionsTestArg);
  console.log(
    "relative delays: ",
    result.relativeDelays[0],
    result.relativeDelays[1],
    result.relativeDelays[2],
    result.relativeDelays[3],
    "\ntimes of execution: ",
    result.timesOfExecution[0],
    result.timesOfExecution[1],
    result.timesOfExecution[2],
    result.timesOfExecution[3]
  );
};
// testConcatActions();

// test the executeActionsSequentially helper function
const testGetActionsChain = async () => {
  await execActionsChain(concatActionsTestArg);
};
//testGetActionsChain();

// test the mac_screenshot.applescript script

const testTakeScreenshot = async () => {
  try {
    await takeScreenshot();
  } catch (error) {
    console.error("Failed to take screenshot:", error);
  }
};

//testTakeScreenshot();

// test the ocr.py script
const imagePath =
  "/Users/a.i./Dev-test/hacking/langchain/screenshots/screenshot_2024-10-20_09-26-33.png";
function testOCR() {
  executeOCR(imagePath, "extract the text of the instagram code from the image")
    .then((text: any) => {
      console.log(text);
    })
    .catch((error: any) => {
      console.error("Error executing OCR:", error);
    });
}

// testOCR();

// test the filterData helper function
const testFilterRetrievedRawData = () => {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.resolve(__dirname, "../../scripts/scrapedData.json");
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const dataArray = JSON.parse(jsonData);
    console.log("Retrieved JSON array:", dataArray);
    const filteredData = filterData(dataArray);
    console.log("Filtered data:", filteredData);
  } catch (error) {
    console.error("Failed to retrieve JSON array:", error);
  }
};

// test the createJsonFromArray helper function
const testCreateJsonFromArray = () => {
  const data = {
    ateco:
      "noleggio di macchine e attrezzature per ufficio (inclusi i computer)",
    Dipendenti: "6 (2024)",
    piva: "04257240988",
  };
  const jsonData = createJsonFromFilteredData(data);
  console.log(jsonData);
};

yargs(hideBin(process.argv))
  .command(
    "test-filter-data",
    "test the filterData helper function",
    () => {},
    async () => {
      await testFilterRetrievedRawData();
    }
  )
  .command(
    "test-create-json",
    "test the createJsonFromArray helper function",
    () => {},
    async () => {
      await testCreateJsonFromArray();
    }
  )
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .parse();

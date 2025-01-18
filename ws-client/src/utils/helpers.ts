import { exec } from "child_process";
import { promisify } from "util";
import puppeteer, { Page } from "puppeteer";
import { DomElementData } from "../models";
import { ExecActionsChainError } from "./errors";

// General helper functions for tecnical tasks
const execAsync = promisify(exec);
/**
 * Execute a sequence of functions with a relative delay of delays[index] milliseconds.
 * @param actions - The functions to execute
 * @param delays - The delays between the functions
 * @param args - The arguments to pass to the functions
 */
const concatActions = async ({
  actions,
  delays: d_,
}: {
  actions: ((z?: any) => void)[];
  delays: number[];
}): Promise<{
  timesOfExecution: number[];
  relativeDelays: number[];
}> => {
  // check if the lengths of actions, delays and args are the same otherwise throw an error
  if (actions.length == d_.length) {
    // compute times of execution of each action
    const timesOfExecution = new Array(actions.length)
      .fill(0)
      .map((_, i) => Math.max(0, 1000 * i) + d_[i]);
    // array of promises
    // actionPromises[i] resolves after the action[i] is executed at the timeOfExecution[i]
    const actionPromises = actions.map((action, i) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          action();
          resolve();
        }, timesOfExecution[i]);
      });
    });
    // wait for all actions to finish
    await Promise.all(actionPromises);
    // compute relative delays
    const relativeDelays = timesOfExecution.map((time, i) => {
      if (i === 0) return time;
      return time - timesOfExecution[i - 1];
    });
    return { timesOfExecution, relativeDelays };
  } else {
    throw new Error("actions, delays and args must have the same length");
  }
};
/**
 * get a promise that resolves when all actions are executed sequentially with the given delays
 * each action is executed against the value returned by the previous action.
 *
 * The n-th action is executed n*1000 + delays[n] milliseconds after the (n-1)-th action has been executed.
 * If no delays are provided, the delay of each action is set to 1000 milliseconds.
 * 
 * @param actions - The functions to execute
 * @param delay - The delay between the functions
 * @param delays - The delays between the functions
 */
const execActionsChain = async ({
  actions,
  delay,
  delays,
}: {
  actions: ((z?: any) => any)[];
  delay?: number;
  delays?: number[];
}): Promise<any> => {
  let d_: number[] = [];
  if (delay) d_ = Array(actions.length).fill(delay);
  else if (delays && delays.length == actions.length) d_ = delays;
  else {
    d_ = Array(actions.length).fill(1000);
  }
  // return a promise that resolves when all actions are executed sequentially


  return actions.reduce((prevPromise, action, i) => {

    return prevPromise.then((value) => {
      return new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          Promise.resolve()
            .then(action)
            .then((value) => resolve(value))
            .catch((error) => {
              // Reject with an ExecActionsChainError containing the index
              reject(new ExecActionsChainError(`Error in execActionsChain: ${error}`, i));
            });
        }, d_[i]);
      });
    })
  }, 
  Promise.resolve())
};
/**
 * Execute a chain of actions on the page until they are all successfully executed or the maximum number of tries is reached.
 *
 * @param actionsChain - an array of functions to be executed on the page
 * @param maxTries - the maximum number of tries to execute the actions
 * @param delay - a relative delay factor between each action
 */
export const repeatedAttack = async (actionsChain: ((x?:any) => Promise<any>)[], maxTries = 4, delay = 1000) => {
  let tries = 0;
  let result: any;
  while (tries < maxTries) {
    result = await execActionsChain({
      actions: actionsChain,
      delay: delay,
    })
      .then((value) => {tries = maxTries; console.log(`repeated attack n. ${tries +1} success`); return value}) // success -> set tries to maxTries and end the cycle
      .catch(async (e: ExecActionsChainError) => {
        // fail -> try again to execute the actions, from the failing one
        console.log(
          `error in scraping piva execActionsChain, tried ${tries + 1}-times`
        );
        tries++;
      });
  }
  return result;
};
/**
 * Executes mac_screenshot.applescript
 * to take a screenshot of mac screen and save it in ~/dev-test/screenshots
 * @returns Promise<string> containing the path of the screenshot
 * @throws Error if the script fails
 */
async function takeScreenshot(): Promise<string> {
  try {
    // execute the applescript to take screenshot and return the path
    const { stdout, stderr } = await execAsync(
      "osascript /Users/a.i./Dev-test/hacking/langchain/scripts/mac_screenshot.applescript"
    );
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    const screenshotPath = stdout.trim();
    console.log(
      "Screenshot taken successfully, the path is:\n",
      screenshotPath
    );
    return screenshotPath; // Trim to remove any trailing newline
  } catch (error) {
    console.error(`exec error: ${error}`);
    throw error;
  }
}
/**
 * Execute python script ocr.py on an image of given path,
 * to extract data from the image.
 *
 * @param imagePath Path to the image file
 * @param prompt Prompt to be used for the OCR
 * @returns Promise<string> Extracted text from the image
 * @throws Error if the script fails
 */
async function executeOCR(imagePath: string, prompt: string): Promise<string> {
  try {
    // execute python script with given imagePath
    const { stdout, stderr } = await execAsync(
      `python3 scripts/ocr.py "${imagePath}" "${prompt}"`
    );
    if (stderr) {
      console.error(`ocr.py script error: ${stderr}`);
      throw new Error("ocr.py script failed");
    }
    return stdout.trim();
  } catch (error) {
    console.error("Error executing ocr.py script:", error);
    throw error;
  }
}
/**
 * Get an array of trimmed strings from a string with multiple lines
 * @param rawTextContent - The string to be processed
 * @returns An array of trimmed strings
 */
const trim = (rawTextContent: string | null | undefined) => {
  if(!rawTextContent) return [];
  return rawTextContent
    ?.split("\n") // Split by newline
    .map((line) => line.trim()) // Trim each line
    .filter((line) => line.length > 0); // Filter out empty lines
}

export {
  takeScreenshot,
  executeOCR,
  concatActions,
  execActionsChain,
  trim
};
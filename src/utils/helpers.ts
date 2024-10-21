import { exec } from "child_process";
import { promisify } from "util";
import puppeteer, { Page } from "puppeteer";

const execAsync = promisify(exec);

export const defaultMessage = (name: string) => `Hello ${name}😃
I saw your contact on a dating app (You can find who i am here -> http://ai.aisoft.sh). 
I think you are a very beautiful woman and I would like to know you better, 
taking a coffee togheter 😉`;
/**
 * Execute a sequence of functions with a relative delay of delays[index] milliseconds.
 * @param actions - The functions to execute
 * @param delays - The delays between the functions
 * @param args - The arguments to pass to the functions
 */
export const concatActions = async ({
  actions,
  delays: d_
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
 * each action is executed against the value returned by the previous action
*/
export const execActionsChain = async ({
  actions,
  delays: d_
}: {
  actions: ((z?: any) => void)[];
  delays: number[]
}) => {
  if (actions.length == d_.length) {
    // compute times of execution of each action
    const timesOfExecution = new Array(actions.length)
      .fill(0)
      .map((_, i) => Math.max(0, 1000 * i) + d_[i]);
    // return a promise that resolves when all actions are executed sequentially
    return actions.reduce(
      (prevPromise, action, i) =>
        prevPromise.then((value) => {
          return new Promise<any>((resolve) => {
            setTimeout(() => {
              const result = action(value); // execute action against the value returned by the previous action
              resolve(result); // Pass the result to the next promise
            }, timesOfExecution[i]);
          });
        }),
      Promise.resolve()
    );
  } else {
    throw new Error("actions, delays and args must have the same length");
  }
};
/**
 * Open the chrome page of given pageUrl using puppeteer, and return the page object
 * @param pageUrl
 * @returns Promise<Page>
 */
export const openChromePage = async (pageUrl: string): Promise<Page> => {
  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Path to your Chrome installation
    userDataDir: "/Users/a.i./Library/Application Support/Google/Chrome", // Path to your Chrome user data
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  // Go to Instagram login page
  await page.goto(pageUrl, {
    waitUntil: "networkidle2", // Wait until the page is fully loaded
    timeout: 60000, // Increase timeout to 60 seconds
  });
  // Check if the page loaded correctly
  const content = await page.content();
  if (
    content.includes("ERR_NAME_NOT_RESOLVED") ||
    content.includes("ERR_CONNECTION_TIMED_OUT")
  ) {
    console.error("Network or DNS issue detected");
    // Handle the error (e.g., retry, use a different URL, etc.)
    throw new Error("Network or DNS issue detected");
  }
  return page;
};
/**
 * Executes mac_screenshot.applescript
 * to take a screenshot of mac screen and save it in ~/dev-test/screenshots
 * @returns Promise<string> containing the path of the screenshot
 * @throws Error if the script fails
 */
export async function takeScreenshot(): Promise<string> {
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
 * to extract ig code from screenshot
 *
 * @param imagePath Path to the image file
 * @returns Promise<string> Extracted text from the image
 * @throws Error if the script fails
 */
export async function executeOCR(imagePath: string): Promise<string> {
  try {
    // execute python script with given imagePath
    const { stdout, stderr } = await execAsync(
      `python3 scripts/ocr.py "${imagePath}"`
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
 * Take screenshot of mac screen, containing the iphone screen
 * retrieve the ig code from the screenshot
 * @returns Promise<string> containing the ig code
 */
export const retrieveIGCode = async () => {
  let screenshotPath = "";
  // PROMISE WRAPPER to allow to wait for the screenshot path
  await new Promise<void>((resolve, reject) => {
    setTimeout(async () => {
      try {
        screenshotPath = await takeScreenshot();
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 9000);
  });
  const igCode = await executeOCR(screenshotPath);
  console.log("The ig code is: ", igCode);
  return igCode;
};

/** 
 * @deprecated better puppeteer api page.type()
 *
 * Simulate user typing in an input element.
 * @param text - The text to type
 * @param inputSelector - The selector of the input element
 */
async function simulateUserTyping(text: string, inputSelector = "input") {
  function simulateTyping(
    inputElement: HTMLInputElement,
    text: string,
    delay = 100
  ) {
    return new Promise<void>((resolve) => {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          inputElement.value += text[i];
          // Trigger input event to simulate real typing
          const event = new Event("input", { bubbles: true });
          inputElement.dispatchEvent(event);
          i++;
        } else {
          clearInterval(intervalId);
          resolve();
        }
      }, delay + Math.random() * 50); // Add some randomness to make it more realistic
    });
  }
  const inputElement = document.querySelector(
    inputSelector
  ) as HTMLInputElement | null;
  if (inputElement) {
    // Simulate focus
    inputElement.focus();
    inputElement.dispatchEvent(new Event("focus", { bubbles: true }));

    // Clear existing value
    inputElement.value = "";
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));

    // Simulate typing
    await simulateTyping(inputElement, text);
    console.log("Finished typing:", text);

    // Trigger various events
    const events = ["input", "keyup", "keydown", "change"];
    events.forEach((eventType) => {
      const event = new Event(eventType, { bubbles: true, cancelable: true });
      inputElement.dispatchEvent(event);
    });

    // Simulate pressing Enter key
    const enterEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      keyCode: 13,
    });
    inputElement.dispatchEvent(enterEvent);

    // Blur the input
    inputElement.blur();
    inputElement.dispatchEvent(new Event("blur", { bubbles: true }));

    // Force a re-render if React is used
    if (inputElement && "_valueTracker" in inputElement) {
      (inputElement as any)._valueTracker!.setValue("");
    }
    inputElement.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    console.error("Input element not found");
  }
}
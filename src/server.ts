import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import puppeteer, { Browser, ElementHandle, EvaluateFunc, Page } from 'puppeteer';

const app = express();
const port = 3069;

let browser: Browser;
let page: Page;

app.use(express.json());

// Initialize Puppeteer and the page object
(async () => {
  browser = await puppeteer.launch({ headless: false }); // Set to true if you don't need to see the browser
  page = await browser.newPage();
  console.log('Puppeteer launched and page created.');
})();

// ### ROUTES ###
/** Transform async functions to catch errors */
const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>):
    RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
      fn(req, res, next).catch(next);
    };
  };

// Navigate to a URL
app.post('/navigate', asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).send('URL is required.');
    }
    await page.goto(url);
    res.send(`Navigated to ${url}`);
  }));
// Click an element
app.post('/click', asyncHandler(async (req: Request, res: Response) => {
    const { selector } = req.body;
    if (!selector) {
      return res.status(400).send('Selector is required.');
    }
    await page.click(selector);
    res.send(`Clicked on ${selector}`);
  }));
// Type into an element
app.post('/type', asyncHandler(async (req: Request, res: Response) => {
    const { selector, text } = req.body;
    if (!selector || !text) {
      return res.status(400).send('Selector and text are required.');
    }
    await page.type(selector, text);
    res.send(`Typed text into ${selector}`);
  }));
// Evaluate a script
app.post('/evaluate', asyncHandler(async (req: Request, res: Response) => {
    const { script } = req.body;
    if (!script) {
      return res.status(400).send('Script is required.');
    }
    
    // Reconstruct the function body from the script string
    const functionBody = `return (async () => { ${script} })();`;
    
    // Create a new Function object with the reconstructed body
    const evaluateFunction = new Function(script);
    if (!evaluateFunction) {
      return res.status(400).send('Script is required.');
    }
    const bodyHandle = await page.$('body');
    console.log(bodyHandle, evaluateFunction);
    const result = await page.evaluate(
        evaluateFunction as EvaluateFunc<[ElementHandle<HTMLBodyElement> | null]>, 
        bodyHandle
    );
    await bodyHandle?.dispose();
    res.json({ result });
  }));
// Get page content
app.get('/content', asyncHandler(async (_req: Request, res: Response) => {
    const content = await page.content();
    res.send(content);
  }));
// Close the browser and exit
app.post('/shutdown', asyncHandler(async (_req: Request, res: Response) => {
    await browser.close();
    res.send('Browser closed.');
    process.exit(0);
  }));
// Centralized error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(500).send('Something went wrong!');
  });

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
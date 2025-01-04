import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
  } from "express";
  import puppeteer, { Browser, Page } from "puppeteer";

  const app = express();
  const port = process.env.PORT || 3000;
  
  let browser: Browser;
  let page: Page;
  
  app.use(express.json());
  
  // Initialize Puppeteer and the page object
  (async () => {
    browser = await puppeteer.launch({ headless: false }); // Set to true if you don't need to see the browser
    page = await browser.newPage();
    console.log("Puppeteer launched and page created.");
  })();
  
  // ### ROUTES ###
  /** Transform async functions to catch errors */
  const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
      fn(req, res, next).catch(next);
    };
  };
  
  // Navigate to a URL
  app.post(
    "/navigate",
    asyncHandler(async (req: Request, res: Response) => {
      const { url } = req.body;
      if (!url) {
        return res.status(400).send("URL is required.");
      }
      await page.goto(url);
      res.send(`Navigated to ${url}`);
    })
  );
  // Wait for an element
  app.post(
    "/waitForSelector",
    asyncHandler(async (req: Request, res: Response) => {
      const { selector } = req.body;
      await page.waitForSelector(selector).then(() => {
        res.send(`Waited for ${selector}`);
      }).catch(() => {
        res.status(404).send(`Element with selector "${selector}" not found.`);
      });
    })
  );
  // Click an element
  app.post(
    "/click",
    asyncHandler(async (req: Request, res: Response) => {
      const { selector } = req.body;
      if (!selector) {
        return res.status(400).send("Selector is required.");
      }
      await page
        .waitForSelector(selector, { timeout: 1200 })
        .then(async () => {
          await page.click(selector);
          res.send(`Clicked on ${selector}`);
        })
        .catch(() => {
          res.status(404).send(`Element with selector "${selector}" not found.`);
        });
    })
  );
  // Type into an element
  app.post(
    "/type",
    asyncHandler(async (req: Request, res: Response) => {
      const { selector, text } = req.body;
      console.log(req.body);
      if (!selector || !text) {
        return res.status(400).send("Selector and text are required.");
      }
      await page
        .waitForSelector(selector, { timeout: 1000 })
        .then(async () => {
          await page.type(selector, text);
          res.send(`Typed text into ${selector}`);
        })
        .catch(() => {
          res.status(200).send(`Element with selector "${selector}" not found.`);
        });
    })
  );
  // Clear text in an input field
  app.post(
    "/clearInput",
    asyncHandler(async (req: Request, res: Response) => {
      const { selector } = req.body;
      if (!selector) {
        return res.status(400).send("Selector is required.");
      }
      await page
        .waitForSelector(selector, { timeout: 1000 })
        .then(async () => {
          await page.focus(selector); // Focus on the input field
          await page.keyboard.down('Control'); // Hold down the Control key
          await page.keyboard.press('A'); // Select all text
          await page.keyboard.up('Control'); // Release the Control key
          await page.keyboard.press('Backspace'); // Delete the selected text
          res.send(`Cleared text in ${selector}`);
        })
        .catch(() => {
          res.status(200).send(`Element with selector "${selector}" not found.`);
        });
    })
  );
  // Evaluate a script
  app.post(
    "/evaluate",
    asyncHandler(async (req: Request, res: Response) => {
      const { script } = req.body;
      if (!script) {
        return res.status(400).send("Script is required.");
      }
      console.log('server evaluating script: ', script);
      const result = await page.evaluate((script) => {
        try {
          const res = eval(script);
          // if res is a HTMLElement, return trhe serialized data
          if (res instanceof HTMLElement) { 
            return {
              text: res.innerText,
              outerHTML: res.outerHTML,
              tagName: res.tagName,
              id: res.id,
              className: res.className || "",
              textContent: res.textContent || "",
            };
          } else 
          // if res is a NodeList, return the array 
          // of the serialized data of each node
          if (res instanceof NodeList) {          
            return Array.from(res).map((node) => {
              if(node instanceof HTMLElement) {
                return {
                  text: node.innerText,
                  outerHTML: node.outerHTML,
                  tagName: node.tagName,
                  id: node.id,
                  className: node.className || "",
                  textContent: node.textContent || "",
                };
              }
              else {
                return {
                  outerHTML: "",
                  tagName: "",
                  id: "",
                  className: "",
                  text: "",
                  textContent: node?.textContent || "",
                };
              }
            });
          }
        } catch (err) {
          if (err instanceof Error) {
            return { error: "an error occurred: " + err.message };
          } else {
            return { error: "An unknown error occurred" };
          }
        }
      }, script);
  
      res.json({ result });
    })
  );
  // Get page content
  app.get(
    "/content",
    asyncHandler(async (_req: Request, res: Response) => {
      const content = await page.content();
      res.send(content);
    })
  );
  // Close the browser and exit
  app.post(
    "/shutdown",
    asyncHandler(async (_req: Request, res: Response) => {
      await browser.close();
      res.send("Browser closed.");
      process.exit(0);
    })
  );
  // Simulate pressing Enter
  app.post(
    "/pressEnter",
    asyncHandler(async (req: Request, res: Response) => {
      await page.keyboard.press("Enter");
      res.send(`Pressed Enter`);
    })
  );
  // Centralized error handling
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(500).send("Something went wrong!");
  });
  
  // Start the Express server
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
  
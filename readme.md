# W-S

W-S, also known as Web-Slayer, allows you to mock sequences of user actions on chrome, helping with:
- automation tasks
- web scraping
- testing

It has a client-server architecture, where the server runs a puppeteer instance and the client sends requests to the server to perform a combination of basic actions.
## Getting started

1. Set the Python environment for the ws-client:
   
```bash
cd ws-client
pip install -r python-env-requirements.txt
```

2. Install the node modules for the ws-client and the ws-server:
   
```bash
npm install
```

```bash
cd ../ws-server
npm install
```

3. Start the puppeteer server:
   
```bash
npm run server-start
```

4. Run commands in the ws-client folder:

```bash
cd ws-client
```

e.g. to get the summary of the ansa economia articles:

```bash
npm run summarize-ansa
```

## Example Commands to try

Commands to get summary of lates news of news sites:
- `npm run summarize-ansa`
- `npm run summarize-milano-finanza`
- `npm run summarize-milano-tech`
- `npm run summarize-fortune-ita`

Command for scraping the data associated to pivas:

- `npm run scrape-pivas`

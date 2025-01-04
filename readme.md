# W-S

## Getting started

1. Set the Python environment for the ws-client_ 
   ```
   cd ws-client
   pip install -r python-env-requirements.txt
   ```

2. install the node modules for the ws-client and the ws-server
   
   ```
   npm install
   ```

   ```
   cd ../ws-server
   npm install
   ```

3. start the server
   
   ```
   npm run dev
   ```

4. run commands in the ws-client folder

   ```
   cd ws-client
   ```

e.g. to get the summary of the ansa economia articles:

   ```
   npm run summarize-ansa
   ```

## Example Commands

commands to get summary of lates news of news sites 
- `npm run summarize-ansa`
- `npm run summarize-milano-finanza`
- `npm run summarize-milano-tech`
- `npm run summarize-fortune-ita`

command for scraping the data associated to pivas 

- `npm run scrape-pivas`

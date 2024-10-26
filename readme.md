
# Getting started

1. start the puppeteer server 
```bash
npm run server-serve
```

2. run commands from the client using the commandline, e.g.
the command:
```bash
npm run navigate 'http://ai.aisoft.sh'
```
will navigate to the url http://ai.aisoft.sh

Whereas the command:
```bash
npm run perform-google-search 'carpone'
```
will perform a google search for 'carpone' and open the first result

# Structure of the app

This app allows to mock the user actions on chrome, helping with:
- automation tasks
- web scraping
- testing

The app is structured in two parts:
- server: runs a puppeteer instance and allows to send commands to it to perform basic user actions 
- client: sends requests to the server to perform a combination of basic actions

In other words, the server exposes endpoints for performing the atomic/basic user actions (navigate, click, type, press enter), for evaluating arbitrary javascript code, for retrievining the whole html of the current page, and for shutting down the server.
A complex action (e.g. perform-linkedIn-login, search-contact, perform-google-search) is implemented in the client via a sequence of server requests. Actions are listed in the package.json file.

# Web-Slayer
This app allows to mock the user actions on chrome, helping with:
- automation tasks
- web scraping
- testing

# Getting started

1. Start the puppeteer server 
```bash
npm run server-serve
```

2. Run commands from the client using the commandline, e.g.
the command:
```bash
npm run navigate 'http://ai.aisoft.sh'
```
will navigate to the url http://ai.aisoft.sh

Whereas the command:
```bash
npm run perform-google-search 'basic bitch'
```
will perform a google search for 'basic bitch' and open the first result

# Structure of the app

The app is structured in two parts:
- server: runs a puppeteer instance and allows to send commands to it to perform basic user actions 
- client: sends requests to the server to perform a combination of basic actions

In other words, the server exposes endpoints for performing the atomic/basic user actions (navigate, click, type, press enter, clear a text input), for evaluating arbitrary javascript code, for retrievining the whole html of the current page, and for shutting down the server.
A complex action (e.g. perform-linkedIn-login, search-contact, perform-google-search) is implemented in the client via a sequence of server requests. Actions are listed in the package.json file.

# TODO
  1. [ ] complete linkedin scraping adding the remaining data of a profile
    1.1 [] create test files
    1.2 [] verify that the input for search is already present after a login when performing search-contact
    1.3 [] add conditional scraping in case of different page configurations
  2. [ ] implement layer that adds the retrieved data to a json file, and to a CSV file
  3. [ ] implement a layer that sends the data to a database
  4. [ ] implement data visualization via charts
  5. [ ] implement app which converts the data of a profile into a CV and produces a webpage with the CV and a pdf
   desiderata: 

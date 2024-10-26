
# Getting started

1. start the puppeteer server 
```bash
npm run server-serve
```

2. run commands from the client using the commandline 

# Structure of the app

This app allows to mock the user actions on chrome, helping with:
- automation tasks
- web scraping
- testing

The app is structured in two parts:
- server: runs a puppeteer instance and allows to send commands to it
- client: contains the commands to be sent to the server

The commands can be sent using the commandline.
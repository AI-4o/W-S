import { Page } from "puppeteer";
import { retrieveIGCode } from "../utils/helpers";

/**
 * perform the login on instagram
 * in particular:
 * - decline optional cookies
 * - authenticate via username and password
 * - authenticate via whatsapp code
 * 
 * @param page 
 * @param username 
 * @param password 
 */
export const performLogin = async (page: Page, username: string, password: string) => {
    // decline optionaL cookiesa
    await page.waitForSelector("._a9_1"); // wait the decline optional cookies button to appear
    await page.click("._a9_1"); // click the decline optional cookies button
    // ### authentication 1: via username and password ###
    await page.waitForSelector('input[name="username"]'); // wait the username input to appear
    await page.type('input[name="username"]', username, { delay: 100 }); // type the username
    await page.type('input[name="password"]', password, { delay: 100 }); // type the password
    await page.click('button[type="submit"]'); // click the login button
  
    // ### authentication 2: via whatsapp code ###
  
    /*
    // click to the 'send sms button'
    const elementSelector =
      'div.x5n08af.x1lliihq.x1f6kntn.x1fcty0u.xd4r4e8.xdj266r.x1m39q7l.xod5an3.x540dpk.x2b8uid button._acan._acao._acas._aj1-._ap30'; 
    await page.waitForSelector(elementSelector);
    await page.click(elementSelector); 
    */
    // wait for the code to be sent, then take screenshot and retrieve the ig code
    //await page.waitForSelector('#twoFactorErrorAlert'); 
  
    const igAuthCode = await retrieveIGCode();
    // submit the ig auth code
    await page.type('input[name="verificationCode"]', igAuthCode, { delay: 100 }); // type the ig code
    await page.click('button[type="button"]'); // click the login button
  }
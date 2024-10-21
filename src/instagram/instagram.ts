import { openChromePage, execActionsChain } from "../utils/helpers";
import { Page } from "puppeteer";

const DATE_NAME = "Antoinette Bocchiny";
const instagramUsername = process.env.INSTAGRAM_USERNAME;
const instagramPassword = process.env.INSTAGRAM_PASSWORD;
const START_PAGE = "https://www.instagram.com/accounts";

const writeMessage = async (dateName: string, message: string, doLogin = true) => {
  if (!instagramUsername || !instagramPassword) {
    throw new Error("Instagram username or password is not set");
  }
  // setup for concatActions
  const actions = [];
  const delays: number[] = [];
  
  actions.push(() => {return openChromePage(START_PAGE)});

  //actions.push(() => {performLogin(_page, instagramUsername, instagramPassword);});
  //actions.push(() => {openContactsSearchInput(_page);});
  //actions.push(() => {clickContactLink(_page);});
  actions.forEach(() => delays.push(1000));
  await execActionsChain({actions, delays});
}

writeMessage(DATE_NAME, "fai footjob");

/**
 * Open the contacts search input.
 * @param dateName - The instagram name of the date
 */
export const openContactsSearchInput = async (page: Page) => {
  await page.waitForSelector('.x4k7w5x');
  const elements = await page.$$('.x4k7w5x.x1h91t0o.x1h9r5lt.x1jfb8zj.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j');
  if (elements.length >= 3) {
    const targetElement = await elements[2].$('div > a');
    console.log('targetElement: ', targetElement);
    
    /**if (targetElement) {
      await targetElement.click();
    }*/
  }
}
/**
 * Simulate click on contact link in users search dropdown.
 */
function clickContactLink(page: Page) {
  document
    ?.getElementsByClassName(
      "x9f619 x78zum5 xdt5ytf x1iyjqo2 x6ikm8r x1odjw0f xh8yej3 xocp1fn"
    )?.[0]
    ?.querySelector("a")
    ?.click();
}
function openChat(page: Page) {
  (
    document.getElementsByClassName(
      "x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w x972fbf xcfux6l x1qhh985 xm0m39n xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x18d9i69 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x1ypdohk x78zum5 x1f6kntn xwhw2v2 x10w6t97 xl56j7k x17ydfre x1swvt13 x1pi30zi x1n2onr6 x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye x1gjpkn9 x5n08af xsz8vos"
    )?.[0] as HTMLElement
  )?.click();
}
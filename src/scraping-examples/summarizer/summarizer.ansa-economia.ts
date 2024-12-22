
import { Article, getArticlesPreviews, extractSubstring, resumeFile } from "./utils.defs";
/*
Questo file fa quanto segue in funzione 'getPageContent': 
1. vai alla pagina
2. estrai contenuto e metti in un file.txt
3. passi file .txt a LLM per fare riassunto
 */

import { repeatedAttack } from "../../utils/helpers";
import * as Cl from "../../client";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const BASE_URL = "https://www.ansa.it";
const HOME_URL = BASE_URL + "/sito/notizie/economia/economia.shtml?refresh_ce";


export const getContents = async () => {
  try {
    // get articles previews
    const previewCh = [
      () => Cl.navigate(HOME_URL),
      () => Cl.click("button.iubenda-cs-accept-btn", false),
      () => Cl.click("button.iubenda-cs-accept-btn", false),
      () =>  Cl.scrapeQSelectorAll("div.articles-list.wide>div"),
    ];
    const articlesPreviews = await getArticlesPreviews(previewCh);

    // get articles 
    const articles = await getArticles(articlesPreviews);
    console.log("\n\nthe retrieved articles are: ", articles);

    // create file.txt with the articles content
    const fileContent = articles.map((article) => article.content).join("\n");
    resumeFile(fileContent);
  } catch (e) {
    console.log("Error getting page content: ", e);
  }
};

const getArticles = async (articlesPreviews: any[]) => {
  // the articles array
  const articles: Article[] = [];
  // get articles Titles
  const titles: string[] = articlesPreviews.map(
    (articlePreview: any) => articlePreview.textContent
  );
  const len = titles.length;
  // get articles urls
  const urls: string[] = articlesPreviews.map((articlePreview: any) => {
    // tecnical details to get the correct url
    const relativeURL = extractSubstring(
      articlePreview.outerHTML,
      'href="',
      ".html"
    )
      .replace('href="', "")
      .concat("html");
    return BASE_URL + relativeURL;
  });
  console.log("the articles urls are: ", urls);
  // get articles contents
  const contents: string[] = [];
  for (let i = 0; i < len; i++) {
    contents.push(await getArticleContent(urls[i]));
  }
  //put everything in the articles array
  if (contents.length !== len || urls.length !== len) {
    throw new Error(
      "Something went wrong: the lengths of the arrays are not equal"
    );
  } else {
    // the lengths of titles, urls and contents are equal
    urls.forEach(async (_, i) => {
      const article: Article = {
        title: titles[i],
        url: urls[i],
        content: contents[i],
      };
      articles.push(article);
    });
    return articles;
  }
};

// scrape the content of an article
const getArticleContent = async (url: string): Promise<string> => {
  const bodyCh = [
    () => Cl.navigate(url),
    () => Cl.scrapeQSelectorAll(`div[itemprop="articleBody"]>p`),
  ];

  const res = await repeatedAttack(bodyCh);
  const content = res?.map((el: any) => el.textContent).join("\n- end of article -\n") ?? "";
  console.log("the text content is: ", content);
  return content;
};
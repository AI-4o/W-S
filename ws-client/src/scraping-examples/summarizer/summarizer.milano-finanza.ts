import { createResumeFile, extractSubstring } from "./utils.defs";
/*
Questo file fa quanto segue in funzione 'getPageContent': 
1. vai alla pagina
2. estrai contenuto e metti in un file.txt
3. passi file .txt a LLM per fare riassunto
 */
import { repeatedAttack } from "../../utils/helpers";
import * as Cl from "../../client";

const BASE_URL = "https://www.milanofinanza.it/";


export const getContents = async (url: string) => {
  try {
    // get articles previews
    let articlesPreviews: any[] = [];
    const previewCh = [
      () => Cl.navigate(BASE_URL+url),
      () => Cl.click(".cl-consent__btn:nth-of-type(2)", false),
      () => Cl.click(".cl-consent__btn:nth-of-type(2)", false),
      async () => {
        const x = await Cl.scrapeQSelectorAll(
          ".container-fluid.section-articles.featured a"
        );
        articlesPreviews = articlesPreviews.concat(x);
      },
      async () => {
        const x = await Cl.scrapeQSelector(
          ".container-fluid.section-articles.wide a"
        );
        articlesPreviews.push(x);
      }
    ];
    await repeatedAttack(previewCh);
    console.log("articlesPreviews: ", articlesPreviews);

    // get urls
    let urls: string[] = articlesPreviews.map((articlePreview: any) => {
      // tecnical details to get the correct url
      const relativeURL = extractSubstring(
        articlePreview.outerHTML,
        'href="',
        '" '
      )
        .replace('href="', "")
        .replace(/"/g, "");
      return BASE_URL + relativeURL;
    })
    urls = [...new Set(urls)];
    console.log("urls: ", urls);

    // get content
    const contents: string[] = [];
    for(let i=0; i<urls.length; i++) {
      contents.push(await getArticleContent(urls[i]));
    }
    createResumeFile(contents);
  } catch (e) {
    console.log("Error getting page content: ", e);
    throw e;
  }
};

// scrape the content of an article
const getArticleContent = async (url: string): Promise<string> => {
  const bodyPargArray: any[] = ['ARTICOLI ECONOMIA MILANO_FINANZA']
  const bodyCh = [
    () => Cl.navigate(url),
    async () => {
      const subtitle = await Cl.scrapeQSelector('h2'); 
      bodyPargArray.push(subtitle);
    },
    async () => {
      const paragraphs = (await Cl.scrapeQSelectorAll(`newsContent.corpo-articolo.clearfix p`));
      bodyPargArray.concat(paragraphs);
    },
  ];
  await repeatedAttack(bodyCh);
  const content = bodyPargArray?.map((el: any) => el.textContent).join("\n") ?? "";
  console.log("the text content of the article is: ", content);
  content.concat("\n- end of article -\n");
  return content;
};



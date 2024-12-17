import { createResumeFile, extractSubstring } from "./utils.defs";
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

const URL = "https://www.fortuneita.com/category/imprese/startup";

export const getContents = async () => {
  try {
    // get articles previews
    let articlesPreviews: any[] = [];

    const classes = `
    .ecs-posts.elementor-posts-container.elementor-posts.elementor-grid.elementor-posts--skin-archive_custom
    .elementor-widget-image .elementor-widget-container a`;
    const previewCh = [
      () => Cl.navigate(URL),
      async () => {
        const x = await Cl.scrapeQSelectorAll(
          ".ecs-posts.elementor-posts-container.elementor-posts.elementor-grid.elementor-posts--skin-archive_custom .elementor-widget-image .elementor-widget-container a"
        );
        articlesPreviews = articlesPreviews.concat(x);
      },
    ];
    await repeatedAttack(previewCh);
    console.log("articlesPreviews: ", articlesPreviews);
    // get urls
    let urls: string[] = articlesPreviews.map((articlePreview: any) => {
      // tecnical details to get the correct url
      const relativeURL = extractSubstring(
        articlePreview.outerHTML,
        'href="',
        '">'
      )
        .replace('href="', "")
        .replace(/"/g, "");
      return relativeURL;
    });
    urls = [...new Set(urls)];
    console.log("urls: ", urls);

    // get content
    const contents: string[] = [];
    for (let i = 0; i < urls.length; i++) {
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
  const bodyCh = [
    () => Cl.navigate(url), 
    () => Cl.scrapeQSelectorAll("div p")
];
  const bodyPargArray = await repeatedAttack(bodyCh);
  const content =
    bodyPargArray?.map((el: any) => el.textContent).join("\n") ?? "";
  console.log("the text content of the article is: ", content);
  content.concat("\n- end of article -\n");
  return content;
};
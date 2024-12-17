import { execSync } from "child_process";
import { repeatedAttack } from "../../utils/helpers";
const fs = require("fs");
// interface modeling a scraped article
export interface Article {
  title: string;
  url: string;
  content: string;
}

export const getArticlesPreviews = async (
  previewCh: (() => Promise<any>)[]
): Promise<any> => {
  try {
    return repeatedAttack(previewCh);
  } catch (e) {
    console.log("Error getting articles previews: ", e);
    return [];
  }
};

export const extractSubstring = (S: string, s0: string, s1: string): string => {
  const startIndex = S.indexOf(s0);
  if (startIndex === -1) {
    console.log('startIndex == -1');
    return "";
  }
  const endIndex = S.indexOf(s1, startIndex);  
  if (endIndex === -1) {
    console.log('endIndex == -1');
    return "";
  }
  const res = S.substring(startIndex, endIndex + 1);   
  return res;
};

export const resumeFile = (content: string) => {
  console.log('the content is: ', content);
  if (content.length == 0) throw new Error("No text to resume!"); 
  else {
    try {
      fs.writeFileSync(
        "retrieved-text.txt",
        content
      );
      execSync("python scripts/resumer-AI/resumer.py", {
        stdio: "inherit",
      });
      console.log("Python script executed successfully.");
      return true;
    } catch (error) {
      console.error("Error executing Python script:", error);
      return false;
    }
  }
};  

export const createResumeFile = (contents: string[]) => {
  const contentString = contents.join("\n");
  resumeFile(contentString);
}


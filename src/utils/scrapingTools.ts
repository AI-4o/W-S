/**
 * Add the filtered data to a json file.
 * @param filteredData The filtered data
 * @param outputPath The path of the json file
 */
export const createJsonFromFilteredData = (
  filteredData: { [key: string]: string },
  outputPath: string = "./scrapedData.json"
) => {
  const fs = require("fs");
  let jsonData: { data: { [key: string]: string }[] } = { data: [] };
  // Check if the file exists
  if (fs.existsSync(outputPath)) {
    // Read the existing data
    const existingData = fs.readFileSync(outputPath, "utf8");
    try {
      jsonData = JSON.parse(existingData);
      console.log("Existing data:", jsonData);
    } catch (error) {
      console.error("Error parsing existing JSON data:", error);
    }
  }

  // Append the new data to the array
  jsonData.data.push(filteredData);

  // Write the updated data back to the file
  fs.writeFileSync(outputPath, JSON.stringify(jsonData), "utf8");
  console.log("Data has been appended to scrapedData.json");
  return jsonData;
};
/**
 * Get an object with the required couples key-value
 * from the scraped data array.
 */
export const filterData = (
  data: any[],
  piva: string,
  targetWords: string[] = ["ateco", "fatturato", "utile", "dipendenti"],
  evils: string[] = ["cod. ateco", "dipendenti"]
): { [key: string]: string } => {
  const firstNotNull = (_i: number, arr: string[]) =>
    arr.find((x, i) => !!x && i > _i);

  data.splice(2);
  data = data
    .map((item) => item.textContent)
    .flat()
    .map((item) => item.split(":"))
    .flat() as string[];

  const _filteredData = data
    .reverse()
    .map((item, _i) => {
      if (!item) return null;
      // find the first previous not null element
      const keywordSuperstring = firstNotNull(_i, data);
      // check if such element contains one of the keywords
      if (keywordSuperstring) {
        let keyword = "";
        const isTargetValue = targetWords.some((word) => {
          if (
            keywordSuperstring.toLowerCase().includes(word) &&
            !keywordSuperstring.toLowerCase().includes(evils[0])
          ) {
            keyword = word;
            return true;
          }
          return false;
        });
        // if the element contains one of the keywords, return the keyword and the value
        if (isTargetValue) {
          item = evils
            .reduce((acc, curr) => {
              return acc.replace(curr, "");
            }, item.toLowerCase())
            .trim();
          return { keyword: keyword, value: item };
        }
      }
      return null;
    })
    .filter((item, _i) => {
      return !!item?.keyword;
    }) as { keyword: string; value: string }[];
  // add piva to the filtered data
  _filteredData.push({
    keyword: "piva",
    value: piva,
  });
  const filteredData = _filteredData.reduce((acc, curr) => {
    acc[curr.keyword] = curr.value;
    return acc;
  }, {} as { [key: string]: string });
  console.log("filteredData: ", filteredData);
  return filteredData;
};

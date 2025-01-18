import * as XLSX from 'xlsx';
import * as fs from 'fs';

/**
 * transform the pivasScrapedData.xlsx file into a pivasScrapedData.json file.
 * @param excelFilePath 
 * @param jsonFilePath 
 */
export function transformExcelToJson(
  excelFilePath: string = 'piva.xlsx',
  jsonFilePath: string = 'piva.json'
) {
  // Legge il file Excel
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0]; // Prende il primo foglio
  const sheet = workbook.Sheets[sheetName];

  // Converte il foglio in un array di array (le prime righe contengono intestazioni)
  const data: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = data.slice(1).flat();

  // Costruisciu un array di oggetti in accordo con la struttura di piva.json:
  // [
  //   {
  //     "id": 0,
  //     "piva": "05174160480",
  //     "done": false
  //   },
  //   ...
  // ]
  const output = rows.map((piva, i) => {
    return {
      id: i,
      piva: piva,
      done: false,
    };
  });

  // Salva il risultato in formato JSON
  fs.writeFileSync(jsonFilePath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`File JSON delle piva creato correttamente: ${jsonFilePath}`);
}
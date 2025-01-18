import * as XLSX from 'xlsx';
import * as fs from 'fs';

/**
 * transform the pivasScrapedData.json file into a pivasScrapedData.xlsx file.
 * @param jsonFilePath 
 * @param excelFilePath 
 */
export function transformJsonToExcel(
  jsonFilePath: string = 'pivasScrapedData.json',
  excelFilePath: string = 'pivasScrapedData.xlsx'
) {
  // Legge il file JSON
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  // Estrae i dati
  const data = jsonData.data.map((item: any) => [
    item.piva,
    item.ateco,
    item.dipendenti,
    item.utile,
    item.fatturato,
  ]);

  // Aggiunge le intestazioni
  const headers = ['PIVA', 'Ateco', 'Dipendenti', 'Utile', 'Fatturato'];
  data.unshift(headers);

  // Crea un nuovo foglio di lavoro
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Crea un nuovo libro di lavoro
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pivas');

  // Scrive il libro di lavoro su un file Excel
  XLSX.writeFile(workbook, excelFilePath);

  console.log(`File Excel delle pivacreato correttamente: ${excelFilePath}`);
}
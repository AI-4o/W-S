import { exec } from 'child_process';
import fs from 'fs';

// Function to execute the Python script and get the extracted_info
function getExtractedInfo(): Promise<any> {
  return new Promise((resolve, reject) => {
    exec('python scripts/estractData.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Python script error output: ${stderr}`);
      }
      try {
        const extractedInfo = JSON.parse(stdout);
        resolve(extractedInfo);
      } catch (parseError) {
        console.error(`Error parsing JSON output: ${parseError}`);
        reject(parseError);
      }
    });
  });
}

// Main function to read, modify, and write data
async function main() {
  try {
    // Get the extracted_info from the Python script
    const extractedInfo = await getExtractedInfo();
    console.log(extractedInfo);
    
    // Read the existing extracted_data.json file
    const dataFilePath = 'extracted_data.json';
    let dataArray: any[] = [];
    if (fs.existsSync(dataFilePath)) {
      const dataContent = fs.readFileSync(dataFilePath, 'utf8');
      dataArray = JSON.parse(dataContent);
    }

    // Calculate the new id based on the length of the array
    const newId = dataArray.length;

    // Add the id field to the extracted_info object
    extractedInfo.id = newId;

    // Push the modified object into the array
    dataArray.push(extractedInfo);

    // Write the updated array back to extracted_data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(dataArray, null, 2));

    console.log('Data has been successfully updated.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
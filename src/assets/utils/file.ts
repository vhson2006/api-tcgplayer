import { readFile } from 'fs/promises';
import * as fs from 'fs';

export const readJSONFile = async (str: string) => {
  console.log(__dirname)
  return JSON.parse(await readFile(str , "utf8"));
}

export const readFolder = async (str: string) => {
  const files = fs.readdirSync(str);
  return files;
}

export const mergeJsonFolder = async (path: any, outDes: any) => {
  let files = fs.readdirSync(path);
  function mergeJson() {
    const output = files.reduce((acum, current) => {
      let data: any = fs.readFileSync(`./${path}/${current}`);
      const newData = JSON.parse(data);

      return [...acum, ...newData];
    }, []);
  
    if (output) {
      fs.writeFileSync(outDes, JSON.stringify(output), 'utf8');
    }
  }
  
  mergeJson();
}
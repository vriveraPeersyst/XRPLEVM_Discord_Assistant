import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

const SUPPORTED = ['.pdf','.png','.jpg','.jpeg','.gif','.csv'];

export async function convertNonTextToTxt(rootDir: string): Promise<string[]> {
  const newFiles: string[] = [];
  async function walk(dir: string) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else {
        const ext = path.extname(e.name).toLowerCase();
        if (!SUPPORTED.includes(ext)) continue;
        const txtPath = full.replace(ext, '.txt');
        if (fs.existsSync(txtPath)) continue;
        let text = '';
        const buf = await fs.promises.readFile(full);
        if (ext === '.pdf') {
          text = (await pdfParse(buf)).text;
        } else if (['.png','.jpg','.jpeg','.gif'].includes(ext)) {
          text = (await Tesseract.recognize(buf, 'eng')).data.text;
        } else if (ext === '.csv') {
          text = buf.toString('utf-8');
        }
        if (text.trim()) {
          fs.writeFileSync(txtPath, text, 'utf-8');
          newFiles.push(txtPath);
        }
      }
    }
  }
  await walk(rootDir);
  return newFiles;
}

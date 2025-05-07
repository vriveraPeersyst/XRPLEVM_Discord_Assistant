// src/convertAllMdToTxt.ts
import fs from 'fs';
import path from 'path';

/**
 * Walks a directory recursively, converts every `.md` file into a `.txt`
 * alongside it (with identical contents), and returns the list of `.txt` paths.
 */
export function convertAllMdToTxt(rootDir: string): string[] {
  const txtFiles: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const txtPath = fullPath.replace(/\.md$/, '.txt');
        fs.writeFileSync(txtPath, content, 'utf-8');
        txtFiles.push(txtPath);
      }
    }
  }

  walk(rootDir);
  return txtFiles;
}

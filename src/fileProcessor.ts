import fs from 'fs';
import path from 'path';

export function gatherTextFiles(rootDir: string): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith('.txt')) out.push(p);
    }
  }
  walk(rootDir);
  return out;
}

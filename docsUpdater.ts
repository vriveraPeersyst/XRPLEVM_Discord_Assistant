import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { convertNonTextToTxt } from './convertNonTextToTxt';  // see step 5

interface RepoConfig { name: string; url: string; }

const CONFIG_PATH = path.resolve(__dirname, '../repos.config.json');
const REPOS_BASE  = path.resolve(__dirname, '../repos');

export async function updateDocsRepos(): Promise<string[]> {
  const git = simpleGit();
  const { repos }: { repos: RepoConfig[] } = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

  // ensure repos/ folder
  fs.mkdirSync(REPOS_BASE, { recursive: true });

  let allTextFiles: string[] = [];
  for (const { name, url } of repos) {
    const dir = path.join(REPOS_BASE, name);
    if (fs.existsSync(dir)) {
      await git.cwd(dir).pull();
    } else {
      await git.clone(url, dir);
    }
    // convert Markdown → .txt
    const { convertAllMdToTxt } = await import('./convertAllMdToTxt');
    allTextFiles.push(...convertAllMdToTxt(dir));
  }

  // process ManualFolder (PDFs, images, CSVs → .txt)
  const manual = path.resolve(__dirname, '../ManualFolder');
  if (fs.existsSync(manual)) {
    allTextFiles.push(...await convertNonTextToTxt(manual));
    // also include any existing .txt there
    const gather = (root: string): string[] => {
      const acc: string[] = [];
      for (const e of fs.readdirSync(root, { withFileTypes: true })) {
        const p = path.join(root, e.name);
        if (e.isDirectory()) gather(p).forEach(x => acc.push(x));
        else if (p.endsWith('.txt')) acc.push(p);
      }
      return acc;
    };
    allTextFiles.push(...gather(manual));
  }

  // remove duplicates
  return Array.from(new Set(allTextFiles));
}

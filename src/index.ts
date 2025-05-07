import { updateDocsRepos } from './docsUpdater';
import { convertNonTextToTxt } from './convertNonTextToTxt';
import { gatherTextFiles }     from './fileProcessor';
import { uploadFile, createVectorStore, addFileToVectorStore, createOrUpdateAssistantWithVectorStore } from './assistantClient';
import { askYesNo }            from './cliUtils';
import fs                      from 'fs';
import path                    from 'path';

// …

const VSTORE_PATH = path.resolve(__dirname, '../vectorStoreId.txt');

async function updateAssistantDocs() {
  const reup = await askYesNo('Re-upload all docs? (y/n): ');
  let vId: string;

  if (reup) {
    // 1) pull & convert repos
    const repoDirs = await updateDocsRepos();

    // 2) convert ManualFolder
    const manual = path.resolve(__dirname, '../ManualFolder');
    await convertNonTextToTxt(manual);

    // 3) gather every .txt
    let allTxt = repoDirs.flatMap(d => gatherTextFiles(d));
    allTxt.push(...gatherTextFiles(manual));

    // 4) upload files
    const fileIds: string[] = [];
    for (const f of allTxt) {
      const { id } = await uploadFile(f);
      fileIds.push(id);
    }

    // 5) create new vector store & persist
    vId = await createVectorStore('UnifiedDocsStore');
    fs.writeFileSync(VSTORE_PATH, vId, 'utf-8');

    // 6) add to vector store
    for (const fid of fileIds) {
      await addFileToVectorStore(vId, fid);
    }
  } else {
    if (!fs.existsSync(VSTORE_PATH)) return updateAssistantDocs();
    vId = fs.readFileSync(VSTORE_PATH, 'utf-8').trim();
  }

  // 7) update / create assistant
  const a = await createOrUpdateAssistantWithVectorStore(vId);
  console.log('Assistant ready:', a.id);
  // store id in memory as before…
}

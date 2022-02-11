import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode";
import { checkDoc } from "./collectDiagnostics";

const ignoreDir = [
  'node_modules',
  '.git',
  '.github',
  '.vscode',
]

function getJsonFiles(jsonPath: string) {
  let jsonFiles: string[] = [];
  function findJsonFile(p: string) {
    let files = fs.readdirSync(p);
    files.forEach(function (item, index) {
      if (ignoreDir.includes(item)) return;
      let fPath = path.join(p, item);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) {
        jsonFiles.push(fPath);
      }
    });
  }
  findJsonFile(jsonPath);
  return jsonFiles
}

export function checkAll() {
  const folders = vscode.workspace.workspaceFolders;
  const writeEmitter = new vscode.EventEmitter<string>();
  if (folders) {
    const pty = {
      onDidWrite: writeEmitter.event,
      close: () => { /* noop*/ },
      open: () => {
        folders.forEach(folder => {
          const allFile = getJsonFiles(folder.uri.fsPath);
          allFile.forEach(async (item) => {
            try {
              const doc = await vscode.workspace.openTextDocument(item);
              if(checkDoc(doc)) {
                writeEmitter.fire(`${item}\r\n\n`);
              }
            } catch (error) {
              
            }
          });
        });
      }
    };
    const terminal = (<any>vscode.window).createTerminal({ name: `format-import`, pty });
    terminal.show();
  }
}

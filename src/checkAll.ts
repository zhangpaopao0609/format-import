import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode";
import { checkDoc } from "./collectDiagnostics";

const ignoreDir = [
  'node_modules',
  '.git',
  '.github',
  '.vscode',
];

const ignoreFile = ['.vue', '.javascript', '.typescript', '.js', '.ts', '.jsx', '.tsx'];

const IMPORT_TERMINAL = 'format-import';

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

function closeImportTerminal() {
	vscode.window.terminals.forEach(terminal => {
    if (terminal.name === IMPORT_TERMINAL) terminal.dispose()
  });
}

export function checkAll() {
  const folders = vscode.workspace.workspaceFolders;
  const writeEmitter = new vscode.EventEmitter<string>();
  if (folders) {
    const pty = {
      onDidWrite: writeEmitter.event,
      close: () => { /* noop*/ },
      open: () => {
        writeEmitter.fire('Here will show all documents path with incorrect import!!\r\n\n');
        folders.forEach(folder => {
          const allFile = getJsonFiles(folder.uri.fsPath);
          allFile.forEach(async (item) => {
            try {
              if (!ignoreFile.includes(path.extname(item))) return;
              const doc = await vscode.workspace.openTextDocument(item);
              if(checkDoc(doc)) {
                writeEmitter.fire(`\x1b[31m${item}\x1b[0m\r\n\n`);
              }
            } catch (error) {
              
            }
          });
        });
      },
      handleInput: (data: string) => {
        // if (data === '\x03') {  // ctrl + c
        //   writeEmitter.dispose()
        // }
      }
    };
    closeImportTerminal();
    const terminal = vscode.window.createTerminal({ name: IMPORT_TERMINAL, pty });
    terminal.show();
  }
}

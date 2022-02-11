// 基本规则是父不得引用子
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { getNowConfig } from "./getImportConfig";
import { isStandardImport } from "./isStandardImport";

interface ImportStandard {
  code: boolean,  // true 无问题， false 有问题
  start: number,
  end: number,
}

const reImport = /import[^'"]+from[^'"]+['|"]([^'"]+)['|"]/g;

// todo 还有缩写
const userModulePrefix = ['.', '/'];

// todo 判断当前模块是否是用户内部的，而非内置或node_moduoles
function isUserModule(path: string): boolean {
  return userModulePrefix.includes(path[0]);
};


export function resolveAlias(p: string, alias: Record<string, string> = {}) {
  for (const key in alias) {
    const re = new RegExp(`^${key}\/`);
    if (re.test(p)) {
      return p.replace(re, `${alias[key]}/`);
    }
    // todo 这里是否有更合理的做法
    const reWithSlash = new RegExp(`^${key}`);
    if (reWithSlash.test(p)) {
      return p.replace(reWithSlash, alias[key]);
    }
  }
  return p;
}

export function makeSurePathIsFile(p: string) {
  try {
    const isDir = fs.statSync(p).isDirectory();
    return isDir ? `${p}/index` : p;
  } catch (error) {
    return p;
  }
}

export function analyseImport(
  doc: vscode.TextDocument,
  text: string,
  lineOfText: vscode.TextLine
): ImportStandard[] {
  let res = undefined;
  const data = [] as ImportStandard[];
  const uri = vscode.window.activeTextEditor!.document.uri;
  const config = getNowConfig(vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath);
  while (res = reImport.exec(text) ) {
    const fromPath = resolveAlias(res[1], config.alias);
    if (isUserModule(fromPath)) {
      const modulePath = path.resolve(doc.uri.path, '..', fromPath);
      const modulePathResolve = makeSurePathIsFile(modulePath)
      const code = isStandardImport(modulePathResolve, doc.uri.path, config);
      const t = lineOfText.text;
      const start = code
        ? 0
        : t.indexOf(res[1]);
      const end = code
        ? 0
        : t.indexOf(res[1]) + res[1].length;
      data.push({ code, start, end });
    }
  };

  return data;
}

// 基本规则是父不得引用子
import * as vscode from "vscode";
import * as path from "path";

import { getNowConfig } from "./getImportConfig";

interface ImportStandard {
  code: boolean,  // true 无问题， false 有问题
  start: number,
  end: number,
}

const reImport = /import[^'"]+from[^'"]+['|"]([^'"]+)['|"]/g;

// todo 还有缩写
const userModulePrefix = ['.', '/'];

// todo 还有用户自定义的文件夹名
const whiteDirName = ['util', 'utils', 'component', 'components'];

// todo 判断当前模块是否是用户内部的，而非内置或node_moduoles
function isUserModule(path: string): boolean {
  return userModulePrefix.includes(path[0]);
};

/**
 * 判断引入是否符合规范，这是本插件的最核心的内容了，这里暂时这样粗略判断
 * @param from 被引用文件地址
 * @param origin 文件地址
 * @returns 是否符合
 */
function isStandardImport(from: string, origin: string, config: Record<string, any>={}): boolean {
  const relativePath = path.relative(from, origin);
  if (relativePath.startsWith('../../../')) {
    return false;
  } else if (relativePath.startsWith('../../')) {
    const fromDirName = path.parse(path.parse(from).dir).base;
    return whiteDirName.concat(config.whiteDirName || []).includes(fromDirName);
  } else {
    return true;
  }
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
      const modulePath = path.join(doc.uri.path, '..', fromPath);
      const code = isStandardImport(modulePath, doc.uri.path, config);
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

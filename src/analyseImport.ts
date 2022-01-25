// 基本规则是父不得引用子
import * as vscode from "vscode";
import * as path from "path";

interface ImportStandard {
  code: boolean,  // true 无问题， false 有问题
  start: number,
  end: number,
}

const reImport = /import[^'"]+from[^'"]+['|"]([^'"]+)['|"]/g;

// todo 还有缩写
const userModulePrefix = ['.', '/']

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
function isStandardImport(from: string, origin: string): boolean {
  const relativePath = path.relative(from, origin);
  if (relativePath.startsWith('../../../')) {
    return false;
  } else if (relativePath.startsWith('../../')) {
    const fromDirName = path.parse(path.parse(from).dir).base;
    return whiteDirName.includes(fromDirName);
  } else {
    return true;
  }
};

export function analyseImport(
  doc: vscode.TextDocument,
  text: string,
): ImportStandard[] {
  let res = undefined;
  const data = [] as ImportStandard[];
  while (res = reImport.exec(text) ) {
    const fromPath = res[1];
    if (isUserModule(fromPath)) {
      const modulePath = path.join(doc.uri.path, '..', fromPath);
      const code = isStandardImport(modulePath, doc.uri.path);

      const start = code
        ? 0
        : text.indexOf(res[1])
      const end = code
        ? 0
        : text.indexOf(res[1]) + res[1].length
      data.push({ code, start, end });
    }
  };

  return data;
}

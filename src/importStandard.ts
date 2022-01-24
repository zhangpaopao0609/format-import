// 基本规则是父不得引用子
import * as vscode from "vscode";
import * as path from "path";

interface ImportStandard {
  code: boolean,  // true 无问题， false 有问题
  data: [number, number],  //[number, number] 标记开始和结尾
}

const reImport = /import.+from.+['|"](.+)['|"]/g;

// !todo 还有缩写
const userModulePrefix = ['.', '/']

const whiteDirName = ['util', 'utils', 'component', 'components'];

// !todo 判断当前模块是否是用户内部的，而非内置或node_moduoles
function isUserModule(path: string): boolean {
  return userModulePrefix.includes(path[0]);
}

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
}

export function importStandard(
  doc: vscode.TextDocument,
  text: string,
): ImportStandard {
  let res;
  while (res = reImport.exec(text) ) {
    const fromPath = res[1];
    if (isUserModule(fromPath)) {
      const modulePath = path.join(doc.uri.path, '..', fromPath);
      return {
        code: isStandardImport(modulePath, doc.uri.path),
        data: [1, 41],
      };
    }
  };
  return {
    code: true,
    data: [0, 0],
  };
}
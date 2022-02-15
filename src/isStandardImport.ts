// 基本规则是父不得引用子
import * as path from "path";

// todo 还有用户自定义的文件夹名
const whiteDirName = ['', 'util', 'utils', 'component', 'components', 'type', 'types', 'store', 'stores', 'router', 'routers', 'api'];

/**
 * 判断引入是否符合规范，这是本插件的最核心的内容了，这里暂时这样粗略判断
 * @param from 被引用文件地址
 * @param origin 文件地址
 * @returns 是否符合
 */
// function isStandardImport(from: string, origin: string, config: Record<string, any>={}): boolean {
//   const relativePath = path.relative(from, origin);
//   const relativePath2 = path.relative(origin, from);
//   console.log(from, origin, relativePath, relativePath2);
//   if (relativePath.startsWith('../../../')) {
//     return false;
//   } else if (relativePath.startsWith('../../')) {
//     const fromDirName = path.parse(path.parse(from).dir).base;
//     return whiteDirName.concat(config.whiteDirName || []).includes(fromDirName);
//   } else {
//     return true;
//   }
// };

function findFirstDirName(p: string) {
  return p.split('/').find((item) => item !== '..') || '';
}

/**
 * 判断引入是否符合规范，这是本插件的最核心的内容了，这里暂时这样粗略判断
 * @param from 
 * @param origin 
 * @param config 
 * @returns 
 */
export function isStandardImport(from: string, origin: string, config: Record<string, any>={}): boolean {
  const relativePath = path.relative(origin, from);
  const dirName = path.dirname(relativePath)
  const firstDirname = findFirstDirName(dirName);
  return whiteDirName.concat(config.whiteDirName || []).includes(firstDirname);
};


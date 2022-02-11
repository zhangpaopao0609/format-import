const path = require('path');

// // 正确的子引用父-----------------------------------------------
// const from1 = '/a/index.js'
// const origin1 = '/a/b';  // b 文件中引用 index.js

// const  r1 = path.relative(from1, origin1);
// console.log(r1);  // ../b

// // 正确的子引用父-----------------------------------------------
// const from2 = '/a/index.js'
// const origin2 = '/a/b/c';  // c 文件中引用 index.js

// const  r2 = path.relative(from2, origin2);
// console.log(r2);  // ../b/c

// // 正确的：同级间引用-----------------------------------------------
// // todo 如果是这种，就需要保证 '/a/b/index.js' 中 b 为 ['utils','component', ....] 中的一个
// const from3 = '/a/b/index.js'
// const origin3 = '/a/c';  // c 文件中引用 index.js

// const  r3 = path.relative(from3, origin3);
// console.log(r3);  // ../../c 

// //! 错误： -----------------------------------------------
// const from4 = '/a/b/c/index.js'
// const origin4 = '/a/d';  // d 文件中引用 index.js

// const  r4 = path.relative(from4, origin4);
// console.log(r4);  // ../../../d


// 总结三点
// 1. 被引用文件地址 与 文件地址 的相对路径如果只有一层 "..", 那么就一定是正确的引用
// 2. 被引用文件地址 与 文件地址 的相对路径如果有两层 "..", 那么分以下情况
//    2.1 如果 被引用文件地址 的外层文件夹为 ['utils','component', ....] 中的一个，那么判定为正确的引用
//    2.2 反之，则判定错误
// 3. 被引用文件地址 与 文件地址 的相对路径如果有三层 "..", 那么直接判断错误


function isStandardImport(from, origin) {
  const relativePath = path.relative(from, origin);
  if (relativePath.startsWith('../../../')) {
    return false;
  } else if (relativePath.startsWith('../../')) {
    const fromDirName = path.parse(path.parse(from).dir).base;
    console.log(fromDirName);
    return true;
  } else {
    return true;
  }
};

const from6 = '/a/index.js';
const origin6 = '/a/c';  // c 文件中引用 index.js

// isStandardImport(from6, origin6);

const dirName = '../../../../mkt-app/utils/a/dataHandle'
// console.log();
const a = dirName.split('/').find((item) => {
  return item !== '..'
});

console.log(a);

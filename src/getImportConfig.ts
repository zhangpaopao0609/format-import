import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode";

const cache = new Map();

/**
 * 将用户提供的缩写标准化为绝对路径
 * @param config 
 * @param root 绝对路径
 */
function addRootForAlias(config: Record<string, any>, root: string) {
  if (config.alias) {
    for (const key in config.alias) {
      if (config.alias[key] && !(config.alias[key] as string).startsWith('/')) {
        config.alias[key] = `${root}/${config.alias[key]}`; 
      }
    }
  }
}

/**
 * 获取工作区中的所有配置文件内容
 * @param fileName 配置文件名
 */
export function getImportConfig(fileName = 'import.json') {
  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    folders.forEach(f => {
      const root = f.uri.fsPath;
      const filePath = path.join(root, fileName);
      let res = undefined;
      if (fs.existsSync(filePath)) {
        res = fs.readFileSync(filePath, 'utf-8');
      };
      const config = JSON.parse(res || '{}');
      addRootForAlias(config, root);
      cache.set(root, config);
    });
  }
}

export function getNowConfig(root?: string) {
  if (root) {
    return cache.has(root)
      ? cache.get(root)
      : {};
  };
  return {};
};


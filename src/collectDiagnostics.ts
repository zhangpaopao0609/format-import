import * as vscode from 'vscode';
import { analyseImport } from "./analyseImport";

export const IMPORT_MENTION = 'import_mention';

const IMPORT = 'import';

function canSkip(text: string): boolean {
	// todo 如果是注释，那么忽略，猜测 vscode 应该提供了内置方法判断当前行是否是注释的，否则 python c++ 怎么破
	// !完全可以只检测 import 语句的，可是怎么仅仅拿到 import 语句呢？
	return text.startsWith('/') || !text.startsWith(IMPORT);
}

/**
 * 为有问题的地方添加错误标志（提示）
 * @param doc 待分析的文档
 * @param lineOfText 当前行的内容
 * @param lineIndex 行索引
 * @returns 错误内容
 */
 function createDiagnostic(
	doc: vscode.TextDocument,
	lineIndex: number,
	start: number,
	end: number,
): vscode.Diagnostic {
	const range = new vscode.Range(lineIndex, start, lineIndex, end);

	const diagnostic = new vscode.Diagnostic(
		range, 
		"When you use 'import', do you want to find the standard?",
		vscode.DiagnosticSeverity.Error,
	);
	diagnostic.code = IMPORT_MENTION;
	return diagnostic;
}

function multipleLineImport(text: string) {
	const reImport = /import[^'"]+from/g;
	return !reImport.test(text);
}

/**
 * 分析文档存在的引入不规范问题
 * @param doc 待分析的文档
 * @param importDiagnostics 问题集合
 */
export function collectDiagnostics(
	doc: vscode.TextDocument,
	importDiagnostics: vscode.DiagnosticCollection,
): void {
	const diagnostics: vscode.Diagnostic[] = [];

	let text = '';
	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
		text += lineOfText.text;
		
		if (canSkip(text)) {
			text = '';
			continue;
		};
		if (multipleLineImport(text)) {
			continue;
		}

		const analyseRes = analyseImport(doc, text, lineOfText);
		text = '';
		analyseRes.forEach(diagnostic => {
			if (!diagnostic.code) {
				diagnostics.push(createDiagnostic(doc, lineIndex, diagnostic.start, diagnostic.end));
			}
		});
	}

	importDiagnostics.set(doc.uri, diagnostics);
}

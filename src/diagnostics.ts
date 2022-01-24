import * as vscode from 'vscode';
import { importStandard } from "./importStandard";

export const IMPORT_MENTION = 'import_mention';

const IMPORT = 'import';

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

/**
 * 分析文档存在的引入不规范问题
 * @param doc 待分析的文档
 * @param importDiagnostics 问题集合
 */
function analyseDiagnostics(
	doc: vscode.TextDocument,
	importDiagnostics: vscode.DiagnosticCollection,
): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
		const text = lineOfText.text;

		// todo 如果是注释，那么忽略，猜测 vscode 应该提供了内置方法判断当前行是否是注释的，否则 python c++ 怎么破
		// if (text.startsWith('/')) {
		// 	continue;
		// };
		// todo 如果不再是以 import 开头，那么直接结束循环，commonjs 呢？ 
		if (!text.startsWith(IMPORT)) continue;
		// !完全可以只检测 import 语句的，可是怎么终止呢？
		
		// if (text.includes(IMPORT)) {
		// 	diagnostics.push(createDiagnostic(doc, lineOfText, lineIndex));
		// };
		const { code, data } = importStandard(doc, text);
		if (code) {
			continue;
		} else {
			const diagnostic = createDiagnostic(doc, lineIndex, ...data);
			diagnostics.push(diagnostic);
		}
	}

	importDiagnostics.set(doc.uri, diagnostics);
}

/**
 * 当文档发生变化时检测问题
 * @param context 
 * @param importDiagnostics 
 */
export function subscribeToDocumentChanges(
	context: vscode.ExtensionContext,
	importDiagnostics: vscode.DiagnosticCollection,
): void {
	if (vscode.window.activeTextEditor) {
		analyseDiagnostics(vscode.window.activeTextEditor.document, importDiagnostics);
	};

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				analyseDiagnostics(editor.document, importDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(
			e => analyseDiagnostics(e.document, importDiagnostics)
		)
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(
			doc => importDiagnostics.delete(doc.uri)
		)
	);
}
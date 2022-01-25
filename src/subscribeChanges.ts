import * as vscode from "vscode";
import { collectDiagnostics } from "./collectDiagnostics";

/**
 * 当文档发生变化时检测问题
 * @param context 
 * @param importDiagnostics 
 */
 export function subscribeChanges(
	context: vscode.ExtensionContext,
	importDiagnostics: vscode.DiagnosticCollection,
): void {
	if (vscode.window.activeTextEditor) {
		collectDiagnostics(vscode.window.activeTextEditor.document, importDiagnostics);
	};

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				collectDiagnostics(editor.document, importDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(
			e => collectDiagnostics(e.document, importDiagnostics)
		)
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(
			doc => importDiagnostics.delete(doc.uri)
		)
	);
}
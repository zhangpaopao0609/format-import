import * as vscode from 'vscode';
import { subscribeChanges } from "./subscribeChanges";
import { getImportConfig } from "./getImportConfig";
import { IMPORT_MENTION } from "./collectDiagnostics";

const RULES = 'format-import.rules';
const CHECKALL = 'format-import.checkAll';

export function activate(context: vscode.ExtensionContext) {
	getImportConfig();
	
	const importDiagnostics = vscode.languages.createDiagnosticCollection("import");
	subscribeChanges(context, importDiagnostics);
	context.subscriptions.push(importDiagnostics);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			"*",
			new ImportInfo(),
			{
				providedCodeActionKinds: ImportInfo.providedCodeActionKinds
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			CHECKALL, 
			() => {
				// todo 检查所有文档的错误，并输出在控制台
			},
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			RULES, 
			() => vscode.env.openExternal(vscode.Uri.parse('https://unicode.org/emoji/charts-12.0/full-emoji-list.html')),
		)
	);
};

export function deactivate() {};


export class ImportInfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		return context.diagnostics
		.filter(diagnostic => diagnostic.code === IMPORT_MENTION)
		.map(diagnostic => this.createCommandCodeAction(diagnostic));
	}

	private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.QuickFix);
		action.command = { command: COMMAND, title: 'Learn more about import-format standards', tooltip: 'This will open the import-format standards page.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
}

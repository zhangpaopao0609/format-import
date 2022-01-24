import * as vscode from 'vscode';
import { subscribeToDocumentChanges } from "./diagnostics";

const COMMAND = 'format-import.rules';

export function activate(context: vscode.ExtensionContext) {
	const importDiagnostics = vscode.languages.createDiagnosticCollection("import");
	context.subscriptions.push(importDiagnostics);

	subscribeToDocumentChanges(context, importDiagnostics);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			'typescript',
			new Emojinfo(),
			{
				providedCodeActionKinds: Emojinfo.providedCodeActionKinds
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMAND, 
			() => vscode.env.openExternal(vscode.Uri.parse('https://unicode.org/emoji/charts-12.0/full-emoji-list.html')),
		)
	);
};

export function deactivate() {};


export class Emojinfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		return context.diagnostics
			.map(diagnostic => this.createCommandCodeAction(diagnostic));
	}

	private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.QuickFix);
		action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
}
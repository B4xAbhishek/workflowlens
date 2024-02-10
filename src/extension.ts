import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Register command to search for files and create code lenses
    let disposable = vscode.commands.registerCommand('extension.searchAndCreateCodeLenses', async () => {
        // Get all text documents in the workspace
        const allTextDocuments = vscode.workspace.textDocuments;

        // Iterate over each text document
        allTextDocuments.forEach(document => {
            let codeLenses: vscode.CodeLens[] = [];
            const lines = document.getText().split(/\r?\n/g);

            // Iterate over each line in the document
            lines.forEach((lineText, lineNumber) => {
                // Check if the line matches the pattern
				const match = lineText.match(/WORKFLOW\[.*\] - STEP (\d+): instruction/);
				console.log('%cextension.ts line:18 match', 'color: #007acc;', match);
                if (match) {
                    const stepNumber = parseInt(match[1]);
                    const range = new vscode.Range(lineNumber, 0, lineNumber, lineText.length);
                    const codeLens = new vscode.CodeLens(range, {
                        title: `Step ${stepNumber}`,
                        command: 'extension.navigateToStep',
                        arguments: [document.uri, stepNumber]
                    });
                    codeLenses.push(codeLens);
                }
            });

            // Add code lenses to the document
            vscode.languages.registerCodeLensProvider(document.uri, {
                provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
                    return codeLenses;
                }
            });
        });
    });

    context.subscriptions.push(disposable);

    // Register command handler for code lens
    vscode.commands.registerCommand('extension.navigateToStep', async (uri: vscode.Uri, stepNumber: number) => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;

        // Open the document if not already opened
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);

        // Scroll to the line with the matching step number
        if (editor) {
            const lines = document.getText().split(/\r?\n/g);
            const line = lines.findIndex(line => line.match(new RegExp(`WORKFLOW\\[.*\\] - STEP ${stepNumber}: instruction`)));
            if (line !== -1) {
                const position = new vscode.Position(line, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position));
            } else {
                vscode.window.showInformationMessage(`Step ${stepNumber} not found.`);
            }
        }
    });
}

export function deactivate() {
    // Cleanup logic if needed
}

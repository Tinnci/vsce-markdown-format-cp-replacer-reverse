import * as vscode from 'vscode';
const CP = ['，','：','？','、','！','。','“','”','（','）'];
const EP = [',',':','?','.','!','。','"','"','(',')'];
const map = new Map();
let len = CP.length;
for(let i =0;i<len;i++){
	map.set(CP[i],EP[i]);
}
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(
	'markdown', {
		provideDocumentFormattingEdits(document:vscode.TextDocument,
				options:vscode.FormattingOptions, 
				token:vscode.CancellationToken){
			const result: vscode.TextEdit[] = [];
			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
			const range = new vscode.Range(start, end);
		    let charArr = document.getText(range).split('');
			for(let i =0;i<charArr.length;i++){
				let char = charArr[i];
				if(map.has(char)){
					charArr[i] = map.get(char);
				}
			}
			result.push(new vscode.TextEdit(range, charArr.join('')));
			return result;
		}
		}));
}
// this method is called when your extension is deactivated
export function deactivate() {}

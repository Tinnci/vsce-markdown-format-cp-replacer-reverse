import * as vscode from "vscode";
// const fs = require("fs"); // Not needed if using vscode.WorkspaceEdit

const CP = ["，", "：", "？", "！", "。", "（", "）"];
const EP = [",", ":", "?", "!", ".", "(", ")"];

const map = new Map();
let len = EP.length;
for (let i = 0; i < len; i++) {
  map.set(EP[i], CP[i]);
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("soratsu.replace", async () => { // Use async as applyEdit returns a Promise
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("请先打开一个文件！");
        return;
      }

      const document = editor.document;
      const text = document.getText();
      let charArr = text.split("");
      let inQuote = false; // State variable to track if currently inside quotes

      for (let i = 0; i < charArr.length; i++) {
        let char = charArr[i];
        if (char === '"') {
          if (!inQuote) {
            charArr[i] = "“"; // Replace with Chinese left quote
            inQuote = true;
          } else {
            charArr[i] = "”"; // Replace with Chinese right quote
            inQuote = false;
          }
        } else if (map.has(char)) {
          // Handle other punctuation marks using the existing map
          charArr[i] = map.get(char);
        }
      }

      const newContent = charArr.join("");

      // Use WorkspaceEdit to replace the entire document content
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      edit.replace(document.uri, fullRange, newContent);

      try {
        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
          vscode.window.showInformationMessage("中文标点符号替换完成！");
        } else {
          vscode.window.showErrorMessage("应用编辑失败。");
        }
      } catch (err: any) {
        vscode.window.showErrorMessage("应用编辑时发生错误: " + err.message);
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}

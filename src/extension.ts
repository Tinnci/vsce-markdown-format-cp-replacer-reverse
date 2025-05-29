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

      // 1. 屏蔽无需处理的内容
      const placeholders = new Map<string, string>();
      let placeholderId = 0;
      let processedText = text;

      // 正则表达式匹配代码块、行内代码和链接等
      // 匹配 fenced code blocks: (^\`{3,}[\\s\\S]*?^\\`{3,}) - Adjusted for correct escaping
      // 匹配 inline code: (\\`[^\\`\\n]+\\`) - Adjusted for correct escaping
      // 匹配 links: (\\[.*?\\]\\(.*?\\)) - Adjusted for correct escaping
      // 匹配 images: (!\\[.*?\\]\\(.*?\\)) - Adjusted for correct escaping
      // Using a combined regex
      const markdownElementsRegex = /(```[\\s\\S]*?```)|(`[^`\\n]+`)|(\\[.*?\\]\\(.*?\\))|(!\\[.*?\\]\\(.*?\\))/gm;

      processedText = processedText.replace(markdownElementsRegex, (match) => {
        const placeholder = `__MD_REPLACER_PLACEHOLDER_${placeholderId++}__`;
        placeholders.set(placeholder, match);
        return placeholder;
      });

      // 2. 在处理过的文本上执行你的标点替换逻辑
      let charArr = processedText.split("");
      let inQuote = false; // State variable to track if currently inside quotes
      let replacementCount = 0; // Counter for replacements

      for (let i = 0; i < charArr.length; i++) {
        let char = charArr[i];
        if (char === '"') {
          if (!inQuote) {
            charArr[i] = "“"; // Replace with Chinese left quote
            inQuote = true;
            replacementCount++;
          } else {
            charArr[i] = "”"; // Replace with Chinese right quote
            inQuote = false;
            replacementCount++;
          }
        } else if (map.has(char)) {
          // Handle other punctuation marks using the existing map
          charArr[i] = map.get(char);
          replacementCount++;
        }
      }

      let newContent = charArr.join("");

      // 3. 恢复被屏蔽的内容
      for (const [placeholder, originalContent] of placeholders.entries()) {
        newContent = newContent.replace(placeholder, originalContent);
      }

      // 4. 应用编辑
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );
      edit.replace(document.uri, fullRange, newContent);

      try {
        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
          vscode.window.showInformationMessage(`中文标点符号替换完成！ 共替换了 ${replacementCount} 个标点符号。`);
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

import * as vscode from "vscode";
const fs = require("fs");

const CP = ["，", "：", "？", "！", "。", "“", "”", "（", "）"];
const EP = [",", ":", "?", "!", ".", '"', '"', "(", ")"];

const map = new Map();
let len = CP.length;
for (let i = 0; i < len; i++) {
  map.set(EP[i], CP[i]);
}
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("soratsu.replace", () => {
      let fileName: string | undefined =
        vscode.window.activeTextEditor?.document.fileName;
      const text = fs.readFileSync(fileName).toString();
      let charArr = text.split("");
      for (let i = 0; i < charArr.length; i++) {
        let char = charArr[i];
        if (map.has(char)) {
          charArr[i] = map.get(char);
        }
      }
      const content = charArr.join("");
      fs.writeFile(fileName, content, (err: Error) => {
        if (err) {
          return;
        }
      });
    })
  );
}
// this method is called when your extension is deactivated
export function deactivate() {}

import * as vscode from "vscode";
// const fs = require("fs"); // Not needed if using vscode.WorkspaceEdit

const CP = ["，", "：", "？", "！", "。", "（", "）"];
const EP = [",", ":", "?", "!", ".", "(", ")"];

const map = new Map();
let len = EP.length;
for (let i = 0; i < len; i++) {
  map.set(EP[i], CP[i]);
}

function processText(
    text: string,
    rulesMap: Map<string, string>,
    handleQuotes: boolean
): { newContent: string; replacementCount: number } {
    // 1. 屏蔽无需处理的内容
    const placeholders = new Map<string, string>();
    let placeholderId = 0;
    let processedText = text;

    // 正则表达式匹配代码块、行内代码和链接等
    const markdownElementsRegex = /(```[\s\S]*?```)|(`[^`\n]+`)|(\[.*?]\(.*?\))|(!\[.*?]\(.*?\))/gm; // Corrected regex for links/images

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

        if (handleQuotes && char === '"') {
            if (!inQuote) {
                charArr[i] = "“"; // Replace with Chinese left quote
                inQuote = true;
            } else {
                charArr[i] = "”"; // Replace with Chinese right quote
                inQuote = false;
            }
            replacementCount++;
        } else if (rulesMap.has(char)) { // Use rulesMap instead of global map
            // Handle other punctuation marks using the provided rules map
            charArr[i] = rulesMap.get(char)!;
            replacementCount++;
        }
    }

    let newContent = charArr.join("");

    // 3. 恢复被屏蔽的内容
    for (const [placeholder, originalContent] of placeholders.entries()) {
        // Use a regex for replacement to handle potential multiple occurrences if any
        // Though with unique placeholders, direct replace should be fine.
        // Using regex just to be safe with special characters in originalContent
        const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex chars
        const regex = new RegExp(escapedPlaceholder, 'g');
        newContent = newContent.replace(regex, originalContent);
    }

    return { newContent, replacementCount };
}

// 2. 创建一个通用的执行函数
async function executeReplace(scope: 'all' | 'selection') {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("请先打开一个文件！");
        return;
    }

    const document = editor.document;
    const edit = new vscode.WorkspaceEdit();
    let totalReplacements = 0;

    let rangesToProcess: readonly vscode.Range[] = [];

    // 从 VS Code 配置读取规则
    const configuration = vscode.workspace.getConfiguration('markdown-cp-replacer');
    // Provide a default empty array for safety, though package.json has a default
    const ruleConfigs: { from: string; to: string }[] = configuration.get('rules', []);
    // Provide a default value
    const handleQuotes: boolean = configuration.get('handleQuotes', true);

    const rulesMap = new Map();
    for (const rule of ruleConfigs) {
        rulesMap.set(rule.from, rule.to);
    }


    if (scope === 'all') {
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
        rangesToProcess = [fullRange];
    } else if (scope === 'selection') {
        // 只处理非空的选区
        rangesToProcess = editor.selections.filter(s => !s.isEmpty);
        if (rangesToProcess.length === 0) {
            vscode.window.showInformationMessage("请先选择要替换标点的文本。");
            return;
        }
    }

    for (const range of rangesToProcess) {
        const originalText = document.getText(range);
        // Pass rulesMap and handleQuotes to processText
        const result = processText(originalText, rulesMap, handleQuotes);

        if (originalText !== result.newContent) {
            edit.replace(document.uri, range, result.newContent);
            totalReplacements += result.replacementCount; // Accumulate count
        }
    }

    if (totalReplacements > 0) {
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(`中文标点符号替换完成！共替换了 ${totalReplacements} 个标点符号。`);
    } else {
        vscode.window.showInformationMessage("在指定范围内没有找到可替换的标点符号。");
    }
}

// 3. 在 activate 函数中注册这两个命令
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("soratsu.replace.all", () => {
            executeReplace('all');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("soratsu.replace.selection", () => {
            executeReplace('selection');
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}

import * as vscode from 'vscode';
import { ManHours, ManHoursUnit } from './models/man-hours';

export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "man-hours-utility" is now active!');

  let disposable = vscode.commands.registerCommand('man-hours-utility.computeManHours', () => {

    let text = vscode.window.activeTextEditor?.document.getText();
    if (!text) {
      vscode.window.showWarningMessage('現在編集中のテキストが取得出来ません😔');
      return;
    }

    const manHoursRegex = /^(?<prefix>[^\n\r]*)工数[^\n\r\d]*(?<amount>\d+(\.\d+)?)[^\d\n\r]*(?<unit>人日|人月|時間|d|h)[^\n\r]*$/gm;
    const matches = Array.from(text.matchAll(manHoursRegex));
    if (!matches.length) {
      vscode.window.showWarningMessage('現在編集中のテキスト内に工数の記載が見当たりません😅');
      return;
    }

    const manHours = new ManHours();
    matches.forEach(x => {
      const prefix = x.groups!.prefix;
      const amount = x.groups!.amount;
      const unit = x.groups!.unit;

      manHours.add(prefix?.trim(), parseFloat(amount), unit as ManHoursUnit);
    });

    const config = vscode.workspace.getConfiguration('man-hours-utility');
    const outputFormat = config.get('outputFormat');
    const shouldOutputDetails = config.get('shouldOutputDetails');

    const computed = {
      totalMonths: manHours.totalMonths(),
      totalDays: manHours.totalDays(),
      records: shouldOutputDetails ? manHours.records : undefined
    };

    const eol = vscode.window.activeTextEditor?.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
    var output = '';
    if (outputFormat === 'plaintext') {
      const details = (computed.records ?? []).map(record => `* ${record.prefix} ${record.amount}[${record.unit}]`);
      output += details.join(eol);
      if (output) {
        output += eol + eol;
      }
      output += `合計: ${computed.totalMonths}人月 (${computed.totalDays}人日)`;
    } else if (outputFormat === 'markdown') {
      const details = (computed.records ?? []).map(record => `* ${record.prefix} ${record.amount}\\[${record.unit}\\]`);
      output += details.join(eol);
      if (output) {
        output += eol + eol;
      }
      output += `__合計: ${computed.totalMonths}人月 (${computed.totalDays}人日)__`;
    } else if (outputFormat === 'json') {
      output = JSON.stringify(computed);
    }

    const editor = vscode.window.activeTextEditor;
    editor?.edit(edit => {
      const lastPosition = (() => {
        if (editor?.selection) {
          return editor?.selection.end;
        }
        const lineCount = editor?.document.lineCount ?? 0;
        const lastLine = lineCount > 0 ? lineCount - 1 : 0;
        return lineCount > 0 ? editor?.document.lineAt(lastLine).range.end : new vscode.Position(0, 0);
      })();
      edit.insert(lastPosition, eol + output + eol);
    });
  });

  context.subscriptions.push(disposable);
}


export function deactivate() { }

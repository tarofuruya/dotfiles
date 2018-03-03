/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const serverUtils = require("../omnisharp/utils");
const options_1 = require("../omnisharp/options");
const protocol_1 = require("../omnisharp/protocol");
const vscode_1 = require("vscode");
class CodeActionProvider extends abstractProvider_1.default {
    constructor(server, reporter) {
        super(server, reporter);
        this._commandId = 'omnisharp.runCodeAction';
        this._resetCachedOptions();
        let d1 = vscode.workspace.onDidChangeConfiguration(this._resetCachedOptions, this);
        let d2 = vscode.commands.registerCommand(this._commandId, this._runCodeAction, this);
        this.addDisposables(d1, d2);
    }
    _resetCachedOptions() {
        this._options = options_1.Options.Read();
    }
    provideCodeActions(document, range, context, token) {
        if (this._options.disableCodeActions) {
            return;
        }
        let line;
        let column;
        let selection;
        // VS Code will pass the range of the word at the editor caret, even if there isn't a selection.
        // To ensure that we don't suggest selection-based refactorings when there isn't a selection, we first
        // find the text editor for this document and verify that there is a selection.
        let editor = vscode.window.visibleTextEditors.find(e => e.document === document);
        if (editor) {
            if (editor.selection.isEmpty) {
                // The editor does not have a selection. Use the active position of the selection (i.e. the caret).
                let active = editor.selection.active;
                line = active.line + 1;
                column = active.character + 1;
            }
            else {
                // The editor has a selection. Use it.
                let start = editor.selection.start;
                let end = editor.selection.end;
                selection = {
                    Start: { Line: start.line + 1, Column: start.character + 1 },
                    End: { Line: end.line + 1, Column: end.character + 1 }
                };
            }
        }
        else {
            // We couldn't find the editor, so just use the range we were provided.
            selection = {
                Start: { Line: range.start.line + 1, Column: range.start.character + 1 },
                End: { Line: range.end.line + 1, Column: range.end.character + 1 }
            };
        }
        let request = {
            FileName: document.fileName,
            Line: line,
            Column: column,
            Selection: selection
        };
        return serverUtils.getCodeActions(this._server, request, token).then(response => {
            return response.CodeActions.map(codeAction => {
                let runRequest = {
                    FileName: document.fileName,
                    Line: line,
                    Column: column,
                    Selection: selection,
                    Identifier: codeAction.Identifier,
                    WantsTextChanges: true,
                    WantsAllCodeActionOperations: true
                };
                return {
                    title: codeAction.Name,
                    command: this._commandId,
                    arguments: [runRequest]
                };
            });
        }, (error) => {
            return Promise.reject(`Problem invoking 'GetCodeActions' on OmniSharp server: ${error}`);
        });
    }
    _runCodeAction(req) {
        return serverUtils.runCodeAction(this._server, req).then(response => {
            if (response && Array.isArray(response.Changes)) {
                let edit = new vscode.WorkspaceEdit();
                let fileToOpen = null;
                let renamedFiles = [];
                for (let change of response.Changes) {
                    if (change.ModificationType == protocol_1.FileModificationType.Renamed) {
                        // The file was renamed. Omnisharp has already persisted
                        // the right changes to disk. We don't need to try to
                        // apply text changes (and will skip this file if we see an edit)
                        renamedFiles.push(vscode_1.Uri.file(change.FileName));
                    }
                }
                for (let change of response.Changes) {
                    if (change.ModificationType == protocol_1.FileModificationType.Opened) {
                        // The CodeAction requested that we open a file. 
                        // Record that file name and keep processing CodeActions.
                        // If a CodeAction requests that we open multiple files 
                        // we only open the last one (what would it mean to open multiple files?)
                        fileToOpen = vscode.Uri.file(change.FileName);
                    }
                    if (change.ModificationType == protocol_1.FileModificationType.Modified) {
                        let uri = vscode.Uri.file(change.FileName);
                        if (renamedFiles.some(r => r == uri)) {
                            // This file got renamed. Omnisharp has already
                            // persisted the new file with any applicable changes.
                            continue;
                        }
                        let edits = [];
                        for (let textChange of change.Changes) {
                            edits.push(vscode.TextEdit.replace(typeConvertion_1.toRange2(textChange), textChange.NewText));
                        }
                        edit.set(uri, edits);
                    }
                }
                let applyEditPromise = vscode.workspace.applyEdit(edit);
                // Unfortunately, the textEditor.Close() API has been deprecated
                // and replaced with a command that can only close the active editor.
                // If files were renamed that weren't the active editor, their tabs will
                // be left open and marked as "deleted" by VS Code
                let next = applyEditPromise;
                if (renamedFiles.some(r => r.fsPath == vscode.window.activeTextEditor.document.uri.fsPath)) {
                    next = applyEditPromise.then(_ => {
                        return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                    });
                }
                return fileToOpen != null
                    ? next.then(_ => {
                        return vscode.commands.executeCommand("vscode.open", fileToOpen);
                    })
                    : next;
            }
        }, (error) => {
            return Promise.reject(`Problem invoking 'RunCodeAction' on OmniSharp server: ${error}`);
        });
    }
}
exports.default = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map
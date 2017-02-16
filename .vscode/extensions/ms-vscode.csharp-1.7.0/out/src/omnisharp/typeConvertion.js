/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
const vscode = require("vscode");
function toLocation(location) {
    let { FileName, Line, Column } = location;
    return new vscode.Location(vscode.Uri.file(FileName), new vscode.Position(Line - 1, Column - 1));
}
exports.toLocation = toLocation;
function toRange(rangeLike) {
    let { Line, Column, EndLine, EndColumn } = rangeLike;
    return new vscode.Range(Line - 1, Column - 1, EndLine - 1, EndColumn - 1);
}
exports.toRange = toRange;
function toRange2(rangeLike) {
    let { StartLine, StartColumn, EndLine, EndColumn } = rangeLike;
    return new vscode.Range(StartLine - 1, StartColumn - 1, EndLine - 1, EndColumn - 1);
}
exports.toRange2 = toRange2;
function createRequest(document, where, includeBuffer = false) {
    let Line, Column;
    if (where instanceof vscode.Position) {
        Line = where.line + 1;
        Column = where.character + 1;
    }
    else if (where instanceof vscode.Range) {
        Line = where.start.line + 1;
        Column = where.start.character + 1;
    }
    let request = {
        Filename: document.fileName,
        Buffer: includeBuffer ? document.getText() : undefined,
        Line,
        Column
    };
    return request;
}
exports.createRequest = createRequest;
function toDocumentSymbol(bucket, node, containerLabel) {
    let ret = new vscode.SymbolInformation(node.Location.Text, kinds[node.Kind], toRange(node.Location), undefined, containerLabel);
    if (node.ChildNodes) {
        for (let child of node.ChildNodes) {
            toDocumentSymbol(bucket, child, ret.name);
        }
    }
    bucket.push(ret);
}
exports.toDocumentSymbol = toDocumentSymbol;
let kinds = Object.create(null);
kinds['NamespaceDeclaration'] = vscode.SymbolKind.Namespace;
kinds['ClassDeclaration'] = vscode.SymbolKind.Class;
kinds['FieldDeclaration'] = vscode.SymbolKind.Field;
kinds['PropertyDeclaration'] = vscode.SymbolKind.Property;
kinds['EventFieldDeclaration'] = vscode.SymbolKind.Property;
kinds['MethodDeclaration'] = vscode.SymbolKind.Method;
kinds['EnumDeclaration'] = vscode.SymbolKind.Enum;
kinds['StructDeclaration'] = vscode.SymbolKind.Enum;
kinds['EnumMemberDeclaration'] = vscode.SymbolKind.Property;
kinds['InterfaceDeclaration'] = vscode.SymbolKind.Interface;
kinds['VariableDeclaration'] = vscode.SymbolKind.Variable;
//# sourceMappingURL=typeConvertion.js.map
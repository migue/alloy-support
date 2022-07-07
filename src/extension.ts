// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AlloyClient } from './alloy-lsp-client';
import { AlloyServer } from './alloy-lsp-server';
import { spawn } from 'child_process';

function isAlloyLangId(id: String): boolean {
	return id === "alloy";
}

let server: AlloyServer;
let client: AlloyClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const alloyJar = context.asAbsolutePath("libs/org.alloytools.alloy.dist.jar");
	console.debug("Using the jar file: " + alloyJar + " to start the Alloy LSP");

	server = new AlloyServer(alloyJar);
	server.start();
	console.info("Started Alloy LSP server");

	client = new AlloyClient();
	client.start();
	console.info("Started Alloy LSP client");

	// Register the `ExecuteAlloyCommand` command
	let disposable = vscode.commands.registerCommand('ExecuteAlloyCommand', (uri: string, ind: number, line: number, char: number) => {
		client.sendMessage("ExecuteAlloyCommand", [uri, ind.toString(), line.toString(), char.toString()]);
	});
	context.subscriptions.push(disposable);

	// Register the `listCommands` command
	disposable = vscode.commands.registerCommand('alloy-support.listCommands', () => {
		let activeEditor = vscode.window.activeTextEditor;

		if (activeEditor && !activeEditor.document.isUntitled && isAlloyLangId(activeEditor.document.languageId)) {
			client.sendMessage("ListAlloyCommands", activeEditor.document.uri.toString());
		}

	});
	context.subscriptions.push(disposable);


	// Register the `openAlloyEditor` command
	disposable = vscode.commands.registerCommand('alloy-support.openAlloyEditor', () => {
		let activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && !activeEditor.document.isUntitled && isAlloyLangId(activeEditor.document.languageId)) {
			spawn("java", ["-jar", alloyJar, "gui", activeEditor.document.fileName]);
		} else {
			spawn("java", ["-jar", alloyJar, "gui"]);
		}
	});
	context.subscriptions.push(disposable);

	// Register the `openLatestInstance` command
	disposable = vscode.commands.registerCommand('alloy-support.openLatestInstance', () => {
		vscode.window.showInformationMessage("This function is not currently implemented");

	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	client.stop();
	server.stop();
}

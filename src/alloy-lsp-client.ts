import {
	LanguageClient, LanguageClientOptions, StreamInfo, ServerOptions, Middleware
} from 'vscode-languageclient';
import * as vscode from 'vscode';

import net = require('net');

async function serverOptions(port: number): Promise<ServerOptions> {
	let continuation: Function;
	let rejectedContinuation: Function;
	let promise = new Promise((r, rejected) => { continuation = r; rejectedContinuation = rejected; });
	let streamPromise: Promise<StreamInfo> = new Promise((resolve) => {
		net.createServer(socket => {
			let res: StreamInfo = { reader: <NodeJS.ReadableStream>socket, writer: socket };
			resolve(res);
		}).listen(port, "localhost", () => continuation())
			.on("error", (err) => {
				console.log("unexpected error listening: " + err);
				rejectedContinuation(err);
			});
	});
	await promise;
	let serverExec: ServerOptions = () => streamPromise;
	return serverExec;
}

export class AlloyClient {
	port: number;
	client: LanguageClient | undefined;
	channel: vscode.OutputChannel;

	constructor(port?: number, ) {
		if (port === undefined) {
			this.port = 11011;
		} else {
			this.port = port;
		}

		this.channel = vscode.window.createOutputChannel("Alloy");
	}

	async start() {
		let clientOptions: LanguageClientOptions = {
			documentSelector: [{ scheme: 'file', language: 'alloy' }],
		};

		this.client = new LanguageClient(
			'AlloyLanguageService',
			'Alloy Language Service',
			await serverOptions(this.port),
			clientOptions,
			false
		);

		this.client.onReady().then(() => {			
			this.client?.onNotification("alloy/commandsListResult", (res: { commands: { title: string; command: vscode.Command; }[]; }) => {
				let commands : {title: string, command: vscode.Command}[] = res.commands;
				let qpitems = commands.map(item => ({ label: item.title, command: item.command}));
				vscode.window.showQuickPick(qpitems, {canPickMany : false, placeHolder : "Select a command to execute"})
					.then(item => {
						console.info("Executing command " + item!.command.command + " with args " + item!.command.arguments! );
						vscode.commands.executeCommand(item!.command.command, ...item!.command.arguments!);
				});
			});

			this.client?.onNotification("alloy/showExecutionOutput", (req: { message: string, messageType: number, bold: boolean }) => {
				vscode.window.showInformationMessage(JSON.stringify(req));
				this.channel.appendLine(JSON.stringify(req));
			});
		});

		this.client.start();
	}

	stop() {
		this.channel.dispose();
		this.client?.stop();
	}

	sendMessage(command:string, params:string|string[]) {
		this.client?.sendNotification(command, params);
	}
}

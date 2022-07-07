import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import {
	Executable, ExecutableOptions
} from 'vscode-languageclient';

export class AlloyServer {
	jar: string;
	port: number;
	server: Executable;
	lspProcess: ChildProcess | undefined;

	constructor(jar: string, port?: number) {
		this.jar = jar;
		if (port === undefined) {
			this.port = 11011;
		} else {
			this.port = port;
		}

		let serverExecOptions: ExecutableOptions = {stdio: "pipe"};
		this.server = {
			command: "java",
			args: ["-jar", this.jar, "lsp", this.port.toString()],
			options: serverExecOptions
		};
	}

	start() {
		this.lspProcess = spawn(this.server.command, this.server.args!);

		this.lspProcess.on("exit", (code, signal) => {
			console.info("Alloy LSP server exited with code: " + code + (signal ? "; signal: " + signal : ""));
		});

		this.lspProcess.on("error", (err) => {
			console.error(err);
		});

		if (this.lspProcess.pid) {
			console.info("Alloy language server process (Alloy JAR) started. PID: " + this.lspProcess.pid);
		}
	}

	stop() {
		this.lspProcess?.kill();
	}
}
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface ServerConfig {
	type: string;
	url: string;
	authenticated: boolean;
}


class ConfigHandler {
	private configFile: string;
	private proxy: string | null;
	private servers: ServerConfig[];


	public constructor(configFile: string) {
		this.configFile = configFile;
		this.proxy = null;
		this.servers = [];
		this.readConfig();	
	}
	
	public getServers(): ServerConfig[] {
		return this.servers;	
	}

	public addServer(config: ServerConfig): void {
		this.servers.push(config);
		this.writeConfig();
	}

	public getProxy(): string|null {
		return this.proxy;
	}

	public setProxy(proxy: string): void {
		this.proxy = proxy;
		this.writeConfig();
	}
	
	private readConfig(): void {
		this.checkConfig();
		const config: any = JSON.parse(fs.readFileSync(this.configFile, "utf-8"));
		this.proxy = config.proxy;
		this.servers = config.servers;
	}

	private writeConfig() {
		fs.writeFileSync(this.configFile, JSON.stringify({
			proxy: this.proxy,
			servers: this.servers
		}, null, 4));
	}

	private checkConfig(): void {
		if (!fs.existsSync(this.configFile) || !fs.statSync(this.configFile).isFile()) {
			fs.writeFileSync(this.configFile, JSON.stringify({
				proxy: null,
				servers: []
			}, null, 4));
		}
	}
}

export const config: ConfigHandler = new ConfigHandler(process.platform == "win32" 
														? path.join(os.homedir(), "AppData", "Roaming", ".nelrc")  
														: path.join(os.homedir(), ".nelrc")
													  );

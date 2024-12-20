import {ServerConfig} from "./config";

export interface PackageInfo {
	downloadURL: string;
	version: string;
	name: string;
}

export interface LookupParameters {
	name: string;
	version: string;
}

class ServerHandler {
	public constructor() {
	}

	public async lookup(server: ServerConfig, lookup: LookupParameters): Promise<PackageInfo | null> {
		try {
			const driver: ServerDriver | null = require(`./drivers/${server.type}`).default;
			if (!driver || !(driver instanceof ServerDriver)) {
				console.log(`WARN: Driver '${server.type}' has no default export or the export is not a valid 'ServerDriver'`);
				return null;
			}

			return await driver.lookup(server, lookup);
		} catch (e) {
			console.log(`ERR: Cannot import driver '${server.type}'`);
			return null;
		}
	}
}

export abstract class ServerDriver {
	public abstract lookup(server: ServerConfig, lookup: LookupParameters): Promise<PackageInfo | null>;
}




export const server: ServerHandler = new ServerHandler();

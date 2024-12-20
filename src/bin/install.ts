import {OptionSet, SubCommandSet} from "@koschel-christoph/node.options";

import {config, ServerConfig} from "../config";
import {server, PackageInfo} from "../server";
import {npm} from "../npm";

function extractDetails(pack: string): [string, string] {
	const [name, version] = pack.split('@');
  
	return [name, version || 'latest'];
}


export default function* install(): Generator<OptionSet> {
	let help: boolean = false;
	let proxy: string | null = null;
	const packages: string[] = [];

	const set: OptionSet = new OptionSet(
		"Usage: nel install <> [<options>]",
		["p=|proxy=", "Defines a {proxy} url", v => proxy = v],
		["h|help", "Prints this help text", () => help = true],
		["<>", "A Package name", v => packages.push(v)]
	);
	yield set;

	if (help) {
		set.printHelpString(process.stdout);
		return;
	}
	
	if (packages.length == 0) {
		return;
	}

	const servers: ServerConfig[] = config.getServers();
	proxy  = proxy == null ? config.getProxy() : proxy;

	(async () => {
		for (const pack of packages) {
			for (const s of servers) {
				// TODO implement auth
				const [name, version] = extractDetails(pack);
				const info: PackageInfo | null = await server.lookup(s, {
					name: name,
					version: version,
					platform: process.platform
				});
				if (!info) {
					continue;
				}	
				await npm.install(info);
			}
		}
	})();
}

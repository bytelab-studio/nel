import {ServerDriver, PackageInfo, LookupParameters} from "../../server";
import {ServerConfig} from "../../config";

import axios from "axios";
import semver from "semver";


interface PKListItem {
	name: string;
	versions: {
		version: string;
		file: string[];
	}[];
}

class StaticServerDriver extends ServerDriver {
	private async fetchPackageList(server: ServerConfig): Promise<PackageInfo[]> {
		try {
			const res = await axios.get(server.url + "/pklist.json");
			if (res.status != 200) {
				return [];
			}
			const list: PKListItem[] = JSON.parse(res.data);
			return list.map(p => p.versions.map(v => ({
				name: p.name,
				version: v.version,
				downloadURL: `${server.url}${v.file}`,
			} as PackageInfo))).flat();
		} catch {
			console.warn(`WARN: Cannot fetch package list from '${server.url}'`);
			return [];
		}
	}
	
	public async lookup(server: ServerConfig, info: LookupParameters): Promise<PackageInfo | null> {
		const packages: PackageInfo[] = await this.fetchPackageList(server);
		if (packages.length == 0) {
			return null;
		}
	    const filtered: PackageInfo[] = packages.filter(p => p.name == info.name);
		if (filtered.length == 0) {
			return null;
		}
		
		if (info.version == "latest") {
			let latest: PackageInfo | null = null;
			for (let i = 0; i < filtered.length; i++) {
				const p: PackageInfo = filtered[i];
				if (!semver.valid(p.version)) {
					continue;
				}
				if (latest == null) {
					latest = p;
					continue;
				}				
				if (semver.gt(p.version, latest.version)) {
					latest = p;
				}
			}

			return latest;
		}

		return null;	
	}
}

import * as child_process from "child_process";

import {PackageInfo} from "./server";


class NPMHandler {
	public async install(info: PackageInfo): Promise<void> {
		await child_process.exec(`npm install ${info.downloadURL}`);
	}
}

export const npm: NPMHandler = new NPMHandler();

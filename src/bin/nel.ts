import {OptionSet, SubCommandSet} from "@koschel-christoph/node.options";

import install from "./install";

function* baseHandler(handler: SubCommandSet) {
	yield new OptionSet();
	
	handler.printHelpString(process.stdout);
}

const set = new SubCommandSet(
	"Usage: nel [<command>] [<options>]",
	baseHandler,
	["install", "Install a package", install]
);

set.parse(process.argv);

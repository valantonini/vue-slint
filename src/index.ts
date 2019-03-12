#! /usr/bin/env node

import { WebClient } from "@slack/client";
import CommandLineArgs from "command-line-args";
import shell from "shelljs";
import { EOL } from 'os';
import path from "path";


const optionDefinitions = [{
    name: "token",
    alias: "t",
    type: String
},
{
    name: "channel",
    alias: "c",
    type: String
},
{
    name: "folder",
    alias: "f",
    type: String
},
{
    name: "users",
    alias: "u",
    type: String
}
];

const options = CommandLineArgs(optionDefinitions)

if (!options.token) {
    console.error("--token is required");
    process.exit(1);
}

if (!options.channel) {
    console.error("--channel is required");
    process.exit(1);
}

if (!options.folder) {
    console.error("--folder is required");
    process.exit(1);
}

if (!options.users) {
    console.error("--users is required");
    process.exit(1);
}

shell.cd(options.folder);
const stylish = shell.exec("npx vue-cli-service lint --no-fix --format stylish", { silent: true }).stdout;
if (stylish.includes("No lint errors found.")) {

    sendMessage("No lint errors found.");
    process.exit(0);
}

const userLookup = require(options.users);
const fileReports = stylish
    .split(/\n\s*\n/)
    .map((file: string) => {
        const splitFile = file.split(EOL);
        const splitHeading = splitFile[0].split(":");
        const filename = splitHeading[0];
        const dir = path.dirname(filename);
        shell.cd(dir);
        const lastCommitter = shell.exec(`git log -n 1 --format=%cn ${filename}`, { silent: true }).stdout.trim();
        const lastCommitterSlackId = userLookup[lastCommitter] || "";
        return {
            file: splitHeading[0],
            errors: splitFile.slice(1),
            lastCommitter: lastCommitter,
            lastCommitterSlackId: lastCommitterSlackId ? `<${lastCommitterSlackId}>` : "",
        }
    });


const web = new WebClient(options.token);
for (const fileReport of fileReports) {
    let msg = "";
    msg += `*${fileReport.file}* ${fileReport.lastCommitterSlackId} ${EOL}`;
    msg += `\`\`\`${EOL}`;
    msg += fileReport.errors.join(EOL);
    msg += EOL;
    msg += `\`\`\`${EOL}`;

    sendMessage(msg);
}

function sendMessage(message: string) {
    (async () => {
        const res = (await web.chat.postMessage({ text: message, channel: options.channel, type: "mrkdwn", link_names: true }));
        if (res.error) {
            console.error(res.error);
        }
    })();
}

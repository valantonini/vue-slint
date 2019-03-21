#!/usr/bin/env node

import { WebClient } from "@slack/client";
import CommandLineArgs from "command-line-args";
import CommandLineUsage from "command-line-usage";
import shell from "shelljs";
import { EOL } from 'os';
import path from "path";
import fs from "fs";

const optionDefinitions = [{
    name: "token",
    alias: "t",
    type: String,
    description: "Slack token for posting to Slack"
},
{
    name: "channel",
    alias: "c",
    type: String,
    description: "Slack channel to post to"
},
{
    name: "folder",
    alias: "f",
    type: String,
    typeLabel: "{underline folder}",
    description: "A VueCLI project with linting configured",
},
{
    name: "users",
    alias: "u",
    type: String,
    typeLabel: "{underline file}",
    description: `JSON file mapping git username to slack handle`
},
{
    name: "version",
    alias: "v",
    type: Boolean,
},
{
    name: "help",
    alias: "h",
    type: Boolean
}
];

const options = CommandLineArgs(optionDefinitions)

if (options.version) {
    console.log("0.0.7");
    process.exit(0);
}

if (options.help) {

    const usage = CommandLineUsage([
        {
            header: "Example usage",
            content: "vue-slint --token xoxb-111111111111-222222222222-abcDef5H1jkLmno9qRSTuvWX --channel my-slack-channel -folder ~/Source/MyVueCliProject -u ~/Source/MyVueCliProject/slackUsers.json"
        },
        {
            header: "Options",
            optionList: optionDefinitions
        }
    ])
    console.log(usage);
    process.exit(0);
}

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

if(!fs.existsSync(options.folder)){
    console.error(`VueCli project ${options.folder} is not a valid directory`);
    process.exit(1);
}

if (!options.users) {
    console.error("--users is required");
    process.exit(1);
}

if(!fs.existsSync(options.users)){
    console.error(`Users file ${options.users} doesn't exist`);
    process.exit(1);
}

shell.cd(options.folder);
const stylish = shell.exec("npx vue-cli-service lint --no-fix --format stylish", { silent: true }).stdout;
if (stylish.includes("No lint errors")) {
    (async () => {
        await sendMessage("No lint errors found")
            .catch(err => console.error(err));
    })();
}
else {
    const userLookup = require(options.users);
    const fileReports = stylish
        .split(/\n\s*\n/)
        .map((file: string) => {
            const splitFile = file.split(/\n/);
            const splitHeading = splitFile[0].split(/:\d.*/);
            const filename = splitHeading[0];
            const dir = path.dirname(filename);
            shell.cd(dir);
            const lastCommitter = shell.exec(`git log -n 1 --format=%cn ${filename}`, { silent: true }).stdout.trim();
            let lastCommitterSlackId = userLookup[lastCommitter] || "";
            lastCommitterSlackId = lastCommitterSlackId.length && lastCommitterSlackId[0] !== "@"
                ? `@${lastCommitterSlackId}`
                : lastCommitterSlackId;

            return {
                file: splitHeading[0],
                errors: splitFile.slice(1),
                lastCommitter: lastCommitter,
                lastCommitterSlackId: lastCommitterSlackId ? `<${lastCommitterSlackId}>` : "",
            }
        });

    for (const fileReport of fileReports) {
        let msg = "";
        msg += `*${fileReport.file}* ${fileReport.lastCommitterSlackId} ${EOL}`;
        msg += `\`\`\`${EOL}`;
        msg += fileReport.errors.join(EOL);
        msg += EOL;
        msg += `\`\`\`${EOL}`;

        (async () => {
            await sendMessage(msg)
                .catch(err => console.error(err));
        })();
    }
}

async function sendMessage(message: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const web = new WebClient(options.token);
        (async () => {
            const res = (await web.chat.postMessage({ text: message, channel: options.channel, type: "mrkdwn", link_names: true }));
            if (res.error) {
                reject(res.error);
            } else {
                resolve("OK");
            }
        })();
    });
}


const {
    WebClient
} = require("@slack/client");
const StringBuilder = require("string-builder");
const CommandLineArgs = require("command-line-args")

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
    name: "file",
    alias: "f",
    type: String
},
{
    name: "fileStart",
    alias: "s",
    type: String
},
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

if (!options.file) {
    console.error("--file is required");
    process.exit(1);
}

var lineReader = require("readline").createInterface({
    input: require("fs").createReadStream(options.file)
});

const stringBuilderOptions = {
    newline: "\r\n"
};
let stringBuilder = new StringBuilder(stringBuilderOptions);

lineReader.on("line", function (line: string) {
    if (line.startsWith("/") /*nix*/ || (line.length > 1 && line.charAt(1) === ":")) {
        if (stringBuilder.toString()) {
            sendMessage(stringBuilder);
            stringBuilder = new StringBuilder(stringBuilderOptions);
        }
        stringBuilder.appendLine(line);
    } else {
        stringBuilder.appendLine(line);
    }
});

lineReader.on("close", () => {
    sendMessage(stringBuilder);
});

function sendMessage(stringBuilder: any) {
    const msg = stringBuilder.toString();
    const web = new WebClient(options.token);
    (async () => {
        // See: https://api.slack.com/methods/files.upload
        const res = await web.files.upload({
            filename: "VueLintReport.txt",
            // You can use a ReadableStream or a Buffer for the file option
            content: msg,
            channels: options.channel
            // Or you can use the content property (but not both)
            // content: "plain string content that will be editable in Slack"
            // Specify channel(s) to upload the file to. Optional, unless also specifying a thread_ts value.
            // channels: "C123456"
        });
    })().catch((err) => {
        console.error(err);
        console.error(msg);
    });
}
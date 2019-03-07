const { WebClient } = require("@slack/client");
const StringBuilder = require("node-stringbuilder");
const CommandLineArgs = require("command-line-args")

const optionDefinitions = [
    { name: "token", alias: "t", type: String },
    { name: "channel", alias: "c", type: String },
    { name: "file", alias: "f", type: String },
    { name: "fileStart", alias: "s", type: String },
];

const options = CommandLineArgs(optionDefinitions)

if (!options.token) {
    console.error("--token is required");
    return 1;
}

if (!options.channel) {
    console.error("--channel is required");
    return 1;
}

if (!options.file) {
    console.error("--file is required");
    return 1;
}

var lineReader = require("readline").createInterface({
    input: require("fs").createReadStream(options.file)
});

const stringBuilderOptions = { newline: "\r\n" };
const stringBuilder = new StringBuilder(stringBuilderOptions);

lineReader.on("line", function (line) {
    if (line.startsWith(options.fileStart)) {
        if (stringBuilder.toString()) {
            sendMessage(stringBuilder.toString());
            stringBuilder.clear();
        }
        stringBuilder.appendLine(line);
    } else {
        stringBuilder.appendLine(line);
    }
});

lineReader.on("close", () => {
    sendMessage(stringBuilder.toString());
});

function sendMessage(msg) {
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
    })();
}
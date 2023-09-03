const querystring = require("querystring");

exports.parseReqBody = async (req) => {
    console.log("Parsing request body");
    const buffers = [];
    for await (const chunk of req) {
        buffers.push(chunk);
    }
    const requestBody = Buffer.concat(buffers).toString();
    console.log("Request body parsed: " + requestBody);

    return JSON.parse(requestBody);
}

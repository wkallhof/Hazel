'use strict';

const Hazel = require("./app/hazel.js");
const config = require("./config.default.js");
const DocumentStorageProvider = require("./app/providers/documentStorageProvider");

let app = new Hazel(config, DocumentStorageProvider);
let server = app.server;

// setup the server
server.set('port', process.env.PORT || 8000);
server.set('ip', process.env.IP || "127.0.0.1");

server.listen(server.get('port'), server.get('ip'), () => {
    console.log("✔ Hazel server listening at %s:%d ", server.get('ip'),server.get('port'));
});

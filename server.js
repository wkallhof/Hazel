"use strict";

const Hazel = require("./app/hazel.js");
const config = require("./config.default.js");
const StorageProvider = require("./app/providers/storageProvider");

let app = new Hazel(config, StorageProvider);
let server = app.server;

// setup the server
server.set("port", process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
server.set("ip", process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

// Handle OpenShift health monitoring
server.get("/health", (req, res, next) => {
    res.writeHead(200);
    res.end();
});

server.listen(server.get("port"), server.get("ip"), () => {
    console.log("✔ Hazel server listening at %s:%d ", server.get("ip"), server.get("port"));
});

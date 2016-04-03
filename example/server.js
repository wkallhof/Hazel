"use strict";

// Reference the Hazel App
const Hazel = require("../index").app;
// Pull in our custom config
const config = require("./config.default.js");
// Use the default Hazel Disk Storage Provider
const StorageProvider = require("../index").storageProvider;

// initilize Hazel
let app = new Hazel(config, StorageProvider);
let server = app.server;

// setup the server
server.set("port", process.env.PORT || 8000);
server.set("ip", process.env.IP || "127.0.0.1");

// listen
server.listen(server.get("port"), server.get("ip"), () => {
    console.log("✔ Hazel server listening at %s:%d ", server.get("ip"), server.get("port"));
});

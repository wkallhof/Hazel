"use strict";

var config = {

    // Your site title (format: page_title - site_title)
    site_title: "Example Wiki",

    // Excerpt length (used in search)
    excerpt_length: 400,

    //Application base url
    base: '/',

    // Path in which to store content (markdown files, etc.)
    content_dir: __dirname + "/content/",

    // Path in which to store uploads (images etc.)
    uploads_dir: __dirname + "/uploads/",

    // Path in which to store data (analytics, etc.)
    data_dir: __dirname + "/data/",

    // Secret key used to sync two servers
    sync_key: "",

    // Optional Lunr locale
    lunr_locale: "",

    // Set to true to enable HTTP Basic Authentication
    authentication: false,
    authentication_mode: "admin",
    credentials: {
        username: "",
        password: ""
    }
};

module.exports = config;

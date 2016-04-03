"use strict";

var config = {

    // Your site title (format: page_title - site_title)
    site_title: "Hazel Wiki",

    // Excerpt length (used in search)
    excerpt_length: 400,

    // Specify the theme to use
    theme_dir: __dirname + "/themes/",
    theme_name: "default",

    // Path in which to store content (markdown files, etc.)
    content_dir: __dirname + "/content/",

    // Path in which to store data (analytics, etc.)
    data_dir: __dirname + "/data/",

    // Path to the static file directory for themes
    public_dir: __dirname + "/themes/default/public/",

    // Secret key used to sync two servers
    sync_key: "",

    // Set to true to enable HTTP Basic Authentication
    authentication: false,
    credentials: {
        username: "",
        password: ""
    }
};

module.exports = config;


"use strict";

var config = {

  // Your site title (format: page_title - site_title)
    site_title: "WMK.IO Wiki",

  // Excerpt length (used in search)
    excerpt_length: 400,

  // Which Theme to Use?
    theme_dir: __dirname + "/themes/",
    theme_name: "default",

  // Specify the path of your content folder where all your '.md' files are located
  // Fix: Needs trailing slash for now!
  // Fix: Cannot be an absolute path
    content_dir: __dirname + "/content/",

    // Specify the path in which to store data (analytics, etc.)
    data_dir: __dirname + "/data/",

  // Where is the public directory or document root?
    public_dir: __dirname + "/themes/default/public/",

  // The base URL of your images folder,
  // Relative to config.public_dir
  // (can use %image_url% in Markdown files)
    image_url: "/images",

    // Key used to sync two servers
    sync_key: "c77f12db-961f-4cf3-8599-64159a4fbf29"
};

// Exports
module.exports = config;


'use strict';

var config = {

  // Your site title (format: page_title - site_title)
  site_title: 'Hazel Wiki',

  // Excerpt length (used in search)
  excerpt_length: 400,

  // Which Theme to Use?
  theme_dir  : __dirname + '/themes/',
  theme_name : 'default',

  // Specify the path of your content folder where all your '.md' files are located
  // Fix: Needs trailing slash for now!
  // Fix: Cannot be an absolute path
  content_dir : __dirname + '/content/',

  // Where is the public directory or document root?
  public_dir  : __dirname + '/themes/default/public/',

  // The base URL of your images folder,
  // Relative to config.public_dir
  // (can use %image_url% in Markdown files)
  image_url: '/images',
};

// Exports
module.exports = config;

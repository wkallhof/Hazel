"use strict";

var config = {

    // Your site title (format: page_title - site_title)
    site_title: "Example Wiki",

    // Your site sections for homepage. For each section below, the home page 
    // will display a section box that lists the document count for documents
    // that have a matching tag. Clicking the section link will list the documents.
    site_sections: [
        {
            'title': 'Tenuatus',
            'description': 'In tellus solent, me caelum ripis, ducere licebit fovebat.',
            'tag': 'manual'
        },
        {
            'title': 'Canentem',
            'description': 'Quis admoverat ferunt nusquam potiere, virtute.',
            'tag': 'team'
        },
        {
            'title': 'Timor',
            'description': 'Ore divite ingemuit ingredior, rediturum!',
            'tag': 'faq'
        }
    ],

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
    // Set the Authentication mode. Options:
    // - "all" : Requires authentication for all pages
    // - "admin" : Requires authentication for only admin pages (edit / save / etc.). 
    //             This allows for a public facing site
    authentication_mode: "admin",
    // If using authentication, set the username and password here.
    credentials: {
        username: "",
        password: ""
    }
};

module.exports = config;

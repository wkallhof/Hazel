module.exports = function(grunt) {
    var themeBase = "app/themes/default/templates/";

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uncss: {
            dist: {
                src: [
                    themeBase + "404.html",
                    themeBase + "document.html",
                    themeBase + "edit.html",
                    themeBase + "home.html",
                    themeBase + "layout.html",
                    themeBase + "search.html",
                    themeBase + "sync.html"
                ],
                dest: "dist/css/tidy.css",
                options: {
                    report: "min" // optional: include to report savings
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-uncss");


    // Default task(s).
    grunt.registerTask("default", ["uncss"]);
};
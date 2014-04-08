module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: true
      },
      my_target: {
        dest: 'dist/ng-t.min.js',
        src: ['ng-t.js']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerMultiTask("removeDir", "Removes a directory", function () {
    var rimraf = require('rimraf');
    rimraf.sync(this.data.src);
  });

  grunt.registerTask('build', ['uglify']);
};  
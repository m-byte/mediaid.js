module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    basebanner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("dd.mm.yyyy") %>\n' +
      ' * Copyright 2016-<%= grunt.template.today("yyyy") %> Matthias Breithaupt\n' +
      ' * Licensed under the <%= pkg.license %> license.\n' +
      ' */',
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= basebanner %>\n' +
          '(function(window){\nvar mediaid = {version:\'<%= pkg.version %>\',parser:{}};\n',
        footer: 'window.mediaid = main;\n}(window));',
        sourceMap: true
      },
      dist: {
        src: ['src/tools.js', 'src/parsers/*.js', 'src/fileId.js', 'src/index.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true,
        sourceMapIn: '<%= concat.dist.dest %>.map',
        banner: '<%= basebanner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'uglify']);
};

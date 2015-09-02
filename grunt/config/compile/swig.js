// Configuration for swig task(s)
// Compile swig templates into HTML
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('swig', {
    server: {
      expand: true,
      cwd: '<%= yeogurt.client %>/templates/',
      dest: '<%= yeogurt.tmp %>/',
      src: ['*.swig'],
      ext: '.html'
    },
    dist: {
      expand: true,
      cwd: '<%= yeogurt.client %>/templates/',
      dest: '<%= yeogurt.dist %>/',
      src: ['*.swig'],
      ext: '.html'
    }
  });

};

module.exports = taskConfig;

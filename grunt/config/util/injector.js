// Configuration for Injector task(s)
// Injects Link/Import statements in to specified files
'use strict';

var _str = require('underscore.string');

var taskConfig = function(grunt) {

  grunt.config.set('injector', {
    options: {

    },
    // Inject application script files into index.html (doesn't include bower)
    swig: {
      options: {
        transform: function(filePath) {
          filePath = filePath.replace('/client/templates/', '../');
          var fileName = filePath.substring(filePath.lastIndexOf('/')+1).slice(0, -5);
          return '{% import "' + filePath + '" as ' + _str.camelize(fileName) + ' %}';
        },
        starttag: '{# [injector:swig] #}',
        endtag: '{# [endinjector] #}'
      },
      files: {
        '<%= yeogurt.client %>/templates/layouts/base.swig': [
          '<%= yeogurt.client %>/templates/modules/*.swig',
        ]
      }
    },
    // Inject component scss into main.scss
    sass: {
      options: {
        transform: function(filePath) {
          filePath = filePath.replace('/client/styles/', '');
          filePath = filePath.replace(/(\/)(_)([a-zA-z]+\.[A-Za-z]*)/, '$1$3');
          
          return '@import ' + filePath.slice(0, -5);
        },
        starttag: '// [injector]',
        endtag: '// [endinjector]'
      },
      files: {
        '<%= yeogurt.client %>/styles/main.sass': [
          '<%= yeogurt.client %>/styles/**/*.sass',
          '!<%= yeogurt.client %>/styles/main.sass'
        ]
      }
    },
  });

};

module.exports = taskConfig;

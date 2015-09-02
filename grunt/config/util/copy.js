// Configuration for Copy task(s)
// Copies specified folders/files to specified destination
'use strict';

var taskConfig = function(grunt) {

  grunt.config.set('copy', {
    server: {
      files: [{
         expand: true,
          cwd: '<%= yeogurt.client %>/',
          dest: '<%= yeogurt.tmp %>',
          src: [
            'styles/styleguide.md'
          ]
        }]
    },
    dist: {
      files: [{
        expand: true,
        cwd: '<%= yeogurt.client %>/',
        dest: '<%= yeogurt.dist %>/',
        src: [
          'styles/styleguide.md',
          'docs/styleguide/public/images',
          'styles/fonts/**/*.{woff,otf,ttf,eot,svg}',
          'scripts/{,**/*,*}.js',
          'images/**/*.{webp}',
          '!*.js',
          '*.{ico,png,txt}'
        ]
      }]
    }
  });

};

module.exports = taskConfig;

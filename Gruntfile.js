var _ = require('lodash');
'use strict';

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var config = {
        src: 'src',
        build: 'build',
        filesToCopy: [
            // for performance we only match one level down: 'test/spec/{,*/}*.js'
            // if you want to recursively match all subfolders: 'test/spec/**/*.js'
            '{,*/}*.{gif,jpeg,jpg,png,webp,gif,ico}',
            '{,*/}*.html',
            '{,*/}*.csv',
            'fonts/{,*/}*.*'
        ]
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,

        // clean out old files from build folders
        clean: {
            dev: {
                files: [{
                    dot: true,
                    src: ['<%= config.build %>/*', '!<%= config.build %>/.git*']
                }]
            }
        },

        // copy static asset files from src/ to build/[dev or dist]
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: config.src,
                        dest: config.build,
                        src: config.filesToCopy
                    }
                ]
            }
        },

        // bundle JS with browserify
        browserify: {
            dev: {
                options: {
                    browserifyOptions: {debug: true}
                },
                files: {'build/scripts/main.js': ['src/scripts/main.js']}
            }
        },

        // compile LESS to CSS
        less: {
            dev: {
                //options: { cleancss: true }, // uncomment to minify
                //files: makeBuildSrcPathObj(config.lessToBuild, config.buildDev)
                files: {'build/styles/main.css': ['src/styles/main.less']}
            }
        },

        // run uglify on JS to minify it
        uglify: {
            dev: {
                //files: makeBuildBuildPathObj(config.jsToBuild, config.buildDist)
                files: {'build/scripts/main.js': 'build/scripts/main.js'}
            }
        },

        // web server for serving files from build/[dev or dist]
        connect: {
            dev: {
                options: {
                    port: '7272',
                    base: config.build
                }
            }
        },

        // watch files for changes and run appropriate tasks to rebuild build/dev
        watch: {
            grunt: {
                files: 'Gruntfile.js',
                tasks: ['buildDev', 'shell:sayBuiltJs']
            },
            less: {
                files: '<%= config.src %>/styles/**/*.*',
                tasks: ['less:dev', 'shell:sayBuiltLess']
            },
            browserify: {
                files: '<%= config.src %>/scripts/**/*.*',
                tasks: ['browserify:dev', 'shell:sayBuiltJs']
            },
            copy: {
                files: [
                    '<%= config.src %>/{,*/}*.{gif,jpeg,jpg,png,webp,gif,ico,csv}',
                    '<%= config.src %>/fonts/{,*/}*.*'
                ],
                tasks: ['copy:dev', 'shell:sayCopied']
            },
            html: {
                files: '<%= config.src %>/**/*.html',
                tasks: ['buildDev', 'shell:sayBuiltJs']
            }
        },

        shell: {
            sayBuiltJs: { command: 'say "built js" -v Cellos' },
            sayBuiltLess: { command: 'say "built less" -v Cellos' },
            sayCopied: { command: 'say "copied files" -v Cellos' }
        }
    });

    // Dev tasks
    grunt.registerTask('buildDev', [
        'clean:dev',      // clean old files out of build/dev
        'copy:dev',       // copy static asset files from app/ to build/dev
        'browserify:dev', // bundle JS with browserify
        'less:dev',       // compile LESS to CSS
    ]);
    grunt.registerTask('serveDev', [
        'buildDev',
        'connect:dev',     // web server for serving files from build/dev
        'watch'            // watch src files for changes and rebuild when necessary
    ]);


    // Task aliases
    grunt.registerTask('dev', ['serveDev']);
    grunt.registerTask('serve', ['serveDev']);
};
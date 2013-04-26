var path = require('path');
var grunt = require('spm-grunt');
var getConfig = require('./lib/config').getConfig;

exports = module.exports = function (options) {
    var dirname = options.args[0] || '';

    if (!grunt.file.isFile(dirname, 'package.json')) {
        grunt.log.error('can not find package.json in `' + dirname + '`!');
    } else {
        grunt.task.options({'done': function() {
            grunt.log.writeln('success build finished.');
        }});

        grunt.invokeTask('chaos-build', options, function (grunt) {
            var config = getConfig(dirname, options);
            grunt.initConfig(config);
            loadTasks();

            var taskList = [
                'clean:dist', // delete dist direcotry first
                'transport:spm',  // src/* -> .build/src/*
                'concat:relative',  // .build/src/* -> .build/dist/*.js
                'concat:all',
                'uglify:js',  // .build/dist/*.js -> .build/dist/*.js
                'md5:js', // .build/dist/*.js -> dist/*-md5.js
                'clean:spm',
                'spm-newline',
                'modify-config',
            ];

            if (options.gzip === 'all' || options.gzip === 'current') {
                taskList.push('compress'); // dist/*-md5.js -> dist/*-md5.js.gz
            }
            grunt.registerInitTask('chaos-build', taskList);
        });
    }
}

function loadTasks() {
    // load built-in tasks
    [
        'grunt-cmd-transport',
        'grunt-cmd-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-copy',
        'grunt-contrib-cssmin',
        'grunt-contrib-clean',
        'grunt-contrib-compress',
        'grunt-md5'
    ].forEach(function (task) {
            var taskdir = path.join(__dirname, 'node_modules', task, 'tasks');
            if (grunt.file.exists(taskdir)) {
                grunt.loadTasks(taskdir);
            }
        });

    grunt.loadTasks(path.join(__dirname, 'tasks'));
}

exports.loadTasks = loadTasks;
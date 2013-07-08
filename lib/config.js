var grunt = require('spm-grunt');

function getConfig(dirname, options) {
    if (!grunt.file.isFile(dirname, 'package.json')) {
        throw new Error('can not find package.json in `' + dirname + '`!');
    }

    var pkg = grunt.file.readJSON(dirname + '/package.json');
    var buildConfig = pkg.spm;
    buildConfig.src = dirname.replace(/[\\\/\.]/g, '');
    buildConfig.family = pkg.family || buildConfig.src;
    buildConfig.outputDir = (options.outputDirectory || 'sea-modules').replace(/\\/g, '/').replace(/\/$/g, '');
    buildConfig.dist = buildConfig.outputDir + '/' + buildConfig.family;
    buildConfig.gzip = options.gzip;

    var data = {
        clean : {
            dist : cleanDistConfig(buildConfig),
            spm : ['.build']
        },
        transport : {
            spm : transportConfig(buildConfig)
        },
        concat : {
            relative : concatRelativeConfig(buildConfig),
            all : concatAllConfig(buildConfig)
        },
        uglify : {
            js : uglifyConfig(buildConfig)
        },
        md5 : md5Config(buildConfig),
        "spm-newline" : {
            target : {
                dist : buildConfig.dist
            }
        },
        "modify-config" : {
            target : {
                filename : options.configFile
            }
        }
    }

    if (buildConfig.gzip === 'all' || buildConfig.gzip === 'current') {
        data.compress = {
            js : gzipConfig(buildConfig)
        }
    }
    return data;
}
exports.getConfig = getConfig;

// clean:dist
function cleanDistConfig(buildConfig) {
    return [buildConfig.dist];
}

// transport:spm
function transportConfig(buildConfig) {
    var transport = require('grunt-cmd-transport');
    var script = transport.script.init(grunt);
    var style = transport.style.init(grunt);
    var text = transport.text.init(grunt);
    var template = transport.template.init(grunt);

    return {
        options : {
            idleading : buildConfig.family + '/',
            paths : [buildConfig.outputDir],
            alias : buildConfig.alias || {},
            parsers : {
                '.js' : [script.jsParser ],
                '.css' : [style.css2jsParser],
                '.html' : [text.html2jsParser],
                '.handlebars' : [template.handlebarsParser]
            },
            handlebars : {
                id: 'handlebars',
                knownHelpers: [],
                knownHelpersOnly: false
            }
        },
        files : [
            {
                cwd : buildConfig.src,
                src : '**/*',
                filter : function (filepath) {
                    // exclude outputDir dir
                    return grunt.file.isFile(filepath) && !grunt.file.doesPathContain(buildConfig.outputDir, filepath);
                },
                dest : '.build/src'
            }
        ]
    };
}

// concat:relative
function concatRelativeConfig(buildConfig) {
    var files = {};
    (buildConfig.output.relative || buildConfig.output || []).forEach(function (f) {
        files['.build/dist/' + f] = '.build/src/' + f;
    });

    return  {
        options : {
            include : 'relative'
        },
        files : files
    };
}

// concat:all
function concatAllConfig(buildConfig) {
    var files = {};
    (buildConfig.output.all || []).forEach(function (f) {
        files['.build/dist/' + f] = '.build/src/' + f;
    });

    return  {
        options : {
            include : 'all',
            paths : [buildConfig.outputDir]
        },
        files : files
    };
}

// uglify:js
function uglifyConfig(buildConfig) {
    var files = {};
    (buildConfig.output.relative || buildConfig.output || []).forEach(function (f) {
        files['.build/dist/' + f] = '.build/dist/' + f;
    });
    (buildConfig.output.all || []).forEach(function (f) {
        files['.build/dist/' + f] = '.build/dist/' + f;
    });
    return {
        files : files
    };
}

function md5Config(buildConfig) {
    var afterMd5 = function (fileChanges) {
        var map = [];
        fileChanges.forEach(function (obj) {
            obj.oldPath = obj.oldPath.replace('.build/dist/', '');
            obj.newPath = obj.newPath.replace(buildConfig.dist + '/', '');
            map.push([obj.oldPath, obj.newPath]);
        });
        grunt.config.set('md5map', map);
    }

    var data = {
        options : {
            encoding : 'utf8',
            keepBasename : true,
            keepExtension : true,
            after : afterMd5
        },
        js : {
            files : [
                {
                    expand : true,     // Enable dynamic expansion.
                    cwd : '.build/dist/',      // Src matches are relative to this path.
                    src : ['**/*.js'], // Actual pattern(s) to match.
                    dest : buildConfig.dist   // Destination path prefix.
                }
            ]
        }
    }
    return data;
}

// compress
// compress all file in 'sea-modules'
function gzipConfig(buildConfig) {
    var dir = buildConfig.gzip === 'all' ? buildConfig.outputDir : buildConfig.dist;
    return {
        options : {
            mode : 'gzip'
        },
        files : [
            {
                expand : true,     // Enable dynamic expansion.
                cwd : dir,      // Src matches are relative to this path.
                src : ['**/*.js'], // Actual pattern(s) to match.
                dest : dir,  // Destination path prefix.
                filter : function (filepath) {
                    return (grunt.file.isFile(filepath) && !grunt.file.exists(filepath + '.gz'));
                }
            }
        ]
    }
}
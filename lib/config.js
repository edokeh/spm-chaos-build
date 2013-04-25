var grunt = require('spm-grunt');

function getConfig(dirname, options) {
    var buildConfig = grunt.file.readJSON(dirname + '/package.json').spm;
    buildConfig.src = dirname;

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
        compress : {
            js : gzipConfig(buildConfig)
        },
        "modify-config" : {
            target : {
                filename : options.configFile
            }
        }
    }
    return data;
}
exports.getConfig = getConfig;

// clean:dist
function cleanDistConfig(buildConfig) {
    var paths = buildConfig.paths || ['sea-modules'];
    return paths.map(function (p) {
        return p + '/' + buildConfig.src;
    });
}

// transport:spm
function transportConfig(buildConfig) {
    var transport = require('grunt-cmd-transport');
    var script = transport.script.init(grunt);
    var style = transport.style.init(grunt);
    var text = transport.text.init(grunt);

    return {
        options : {
            idleading : buildConfig.src + '/',
            alias : buildConfig.alias || {},
            parsers : {
                '.js' : [script.jsParser ],
                '.css' : [style.css2jsParser],
                '.html' : [text.html2jsParser ]
            }
        },
        files : [
            {
                cwd : buildConfig.src,
                src : '**/*',
                filter : 'isFile',
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
            paths : buildConfig.paths
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
    var paths = buildConfig.paths || ['sea-modules'];
    var afterMd5 = function (fileChanges) {
        var map = [];
        fileChanges.forEach(function (obj) {
            obj.oldPath = obj.oldPath.replace('.build/dist/', '');
            buildConfig.paths.forEach(function (p) {
                obj.newPath = obj.newPath.replace(p + '/' + buildConfig.src + '/', '');
            })
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
            files : paths.map(function (p) {
                return {
                    expand : true,     // Enable dynamic expansion.
                    cwd : '.build/dist/',      // Src matches are relative to this path.
                    src : ['**/*.js'], // Actual pattern(s) to match.
                    dest : p + '/' + buildConfig.src   // Destination path prefix.
                }
            })
        }
    };
    return data;
}

// compress
function gzipConfig(buildConfig) {
    var paths = buildConfig.paths || ['sea-modules'];

    return {
        options : {
            mode : 'gzip'
        },
        files : paths.map(function (p) {
            return {
                expand : true,     // Enable dynamic expansion.
                cwd : p + '/' + buildConfig.src + '/',      // Src matches are relative to this path.
                src : ['**/*'], // Actual pattern(s) to match.
                dest : p + '/' + buildConfig.src,  // Destination path prefix.
                filter : 'isFile'
            }
        })
    }
}
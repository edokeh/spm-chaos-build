var grunt = require('spm-grunt');

function getConfig(dirname, options) {
    var buildConfig = grunt.file.readJSON(dirname + '/package.json').spm;
    buildConfig.src = dirname.replace(/[\\\/\.]/g, '');
    buildConfig.dist = (options.outputDirectory || 'sea-modules').replace(/\\/g, '/').replace(/\/$/g, '');
    buildConfig.gzip = options.gzip ;

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
        "modify-config" : {
            target : {
                filename : options.configFile
            }
        }
    }

    if(buildConfig.gzip === 'all' || buildConfig.gzip === 'current'){
        data.compress = {
            js : gzipConfig(buildConfig)
        }
    }
    return data;
}
exports.getConfig = getConfig;

// clean:dist
function cleanDistConfig(buildConfig) {
    return [buildConfig.dist + '/' + buildConfig.src];
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
            paths : [buildConfig.dist]
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
            obj.newPath = obj.newPath.replace(buildConfig.dist + '/' + buildConfig.src + '/', '');
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
                    dest : buildConfig.dist + '/' + buildConfig.src   // Destination path prefix.
                }
            ]
        }
    }
    return data;
}

// compress
// compress all file in 'sea-modules'
function gzipConfig(buildConfig) {
    var dir = buildConfig.gzip === 'all' ? buildConfig.dist : buildConfig.dist + '/' + buildConfig.src;
    return {
        options : {
            mode : 'gzip'
        },
        files : [
            {
                expand : true,     // Enable dynamic expansion.
                cwd : dir,      // Src matches are relative to this path.
                src : ['**/*'], // Actual pattern(s) to match.
                dest : dir,  // Destination path prefix.
                filter : 'isFile'
            }
        ]
    }
}
module.exports = function (grunt) {
    var path = require('path');
    var zlib = require('zlib');
    var fs = require('fs');

    var MAP_TPL = grunt.file.read(path.join(__dirname, 'map.tpl'));

    // add md5-map to seajs config
    grunt.registerMultiTask('modify-config', function () {
        if (!this.data.filename) {
            grunt.log.warn('Missing config file option.');
            return;
        }
        if (!grunt.file.exists(this.data.filename)) {
            var code = '';
        } else {
            var code = grunt.file.read(this.data.filename);
        }
        code = code.replace(/\/\*map start\*\/[\s\S]*\/\*map end\*\//, '').trim();
        var mapArr = grunt.config.get('md5map');
        code = grunt.template.process(MAP_TPL, {data : {mapJSON : JSON.stringify(mapArr, null, '\t')}}) + '\n' + code;
        grunt.file.write(this.data.filename, code);
        grunt.log.writeln('File "' + this.data.filename + '" modified.');
    });
};
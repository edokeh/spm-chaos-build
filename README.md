# spm-chaos-build

> Build Sea.js Business Modules by Chaos's way.

-----

## Getting Started

这是一个 Spm2 的插件，使用一种自定义的方式来打包 (build) 业务模块（不是标准模块哦）

打包的方式请参见[如何使用 Spm2 压缩合并业务模块](http://chaoskeh.com/blog/how-to-build-seajs-business-module-by-spm2.html)

一个简单的例子参见这里 https://github.com/edokeh/spm-chaos-build-example

## Install

请先确保你已经安装了最新的 Node.js

    $ npm install spm -g
    $ npm install spm-chaos-build -g

## Usage

    $ spm chaos-build [dir] [options]

Options

* **-C**         指定 Sea.js 的配置文件，build 完成后会将 MD5 的 MAP 规则写入这个文件
* **-O**         指定 build 的输出目录，这个目录应该是 Sea.js 的标准模块目录，里面应该包含业务代码所依赖的标准模块（如 jQuery），可省略此参数，缺省为 sea-modules 目录
* **--gzip**  是否压缩输出目录下所有的文件，参数接受 all/current ，分别表示压缩输出目录下所有文件或只压缩此次生成的文件
 
### Example
    
    $ spm chaos-build example -C seajs-config.js
    $ spm chaos-build example -C seajs-config.js --gzip current
    $ spm chaos-build example -C seajs-config.js -O ../modules
    $ spm chaos-build example -C seajs-config.js -O libs --gzip all
    
    
## 自定义任务

与 spm build 一样，支持通过目录下的 Gruntfile.js 来自定义任务，示例代码如下

```javascript
var chaosBuild = require('spm-chaos-build');

module.exports = function (grunt) {
    chaosBuild.loadTasks(grunt);

    var config = chaosBuild.getConfig('javascripts', {
        outputDirectory : 'javascripts/sea-modules',
        gzip : 'all'
    });
    grunt.initConfig(config);

    grunt.registerTask('write-manifest', function () {
        var mapArr = grunt.config.get('md5map');
        var family = config.family;
        grunt.file.write('seajs-map.json', JSON.stringify(mapArr, null, '\t'));
    });

    grunt.registerTask('chaos-build', [
        'clean:dist', // delete dist direcotry first
        'transport:spm',  // src/* -> .build/src/*
        'concat:relative',  // .build/src/* -> .build/dist/*.js
        'concat:all',
        'uglify:js',  // .build/dist/*.js -> .build/dist/*.js
        'md5:js', // .build/dist/*.js -> dist/*-md5.js
        'clean:spm',
        'spm-newline',
        'compress',
        'write-manifest'
    ]);
};
```

从 0.2.4 开始支持更细粒度的 concat 配置，如

```javascript
var config = chaosBuild.getConfig('javascripts', {
    outputDirectory : 'javascripts/sea-modules',
    gzip : 'all'
});
config.concat.relative = [
  "test/a.js",
  {"test/b.js": ["test/b.js", "template/*.html.js"]},
  "test/c.js"
];
```

## History

### 0.2.5

Fix bug

### 0.2.4

* 支持更细粒度的 concat 规则配置
* 将依赖的 grunt-cmd-transport， grunt-cmd-concat 更新至最新版本

### 0.2.3
* 将依赖的 grunt-cmd-transport， grunt-cmd-concat 更新至最新版本
* 默认支持对 handlebars 后缀文件的打包支持，规则同 grunt-cmd-transport ，如需指定 handlebars 的模块 ID ，可以在 package.json 的 spm.alias 中配置

### 0.2.0
* 如果你不喜欢目录的名字，可以在 package.json 中增加 family 项
* 支持输出目录位于业务模块目录内
* 支持 Gruntfile 的自定义任务

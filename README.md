# spm-chaos-build

> Build SeaJS Business Modules by Chaos's way.

-----

## Getting Started

这是一个 Spm2 的插件，使用一种自定义的方式来打包 (build) 业务模块（不是标准模块哦）
打包的方式请参见此文 http://chaoskeh.com/blog/how-to-build-seajs-business-module-by-spm2.html
一个简单的例子参见这里 https://github.com/edokeh/spm-chaos-build-example

## Install

请先确保你已经安装了最新的 NodeJS & git

    $ npm install spm -g
    $ npm install spm-chaos-build -g

## Usage

    $ spm chaos-build [dir] [options]

Options

* **-C**         指定 SeaJS 的配置文件，build 完成后会将 MD5 的 MAP 规则写入这个文件
* **-O**         指定 build 的输出目录，这个目录应该是 SeaJS 的标准模块目录，里面应该包含业务代码所依赖的标准模块（如 jQuery），可省略此参数，缺省为 sea-modules 目录
* **--gzip**  是否压缩输出目录下所有的文件，参数接受 all/current ，分别表示压缩输出目录下所有文件或只压缩此次生成的文件
 
### Example
    
    $ spm chaos-build example -C seajs-config.js
    $ spm chaos-build example -C seajs-config.js --gzip current
    $ spm chaos-build example -C seajs-config.js -O ../modules
    $ spm chaos-build example -C seajs-config.js -O libs --gzip all
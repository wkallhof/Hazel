[![Hazel: Fast, simple, markdown powered wiki knowledge base for NodeJs](logo.jpg)](http://hazel.wmk.io/)

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Windows Build][appveyor-image]][appveyor-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

## Installation

```bash
$ npm install hazel-wiki
```

## Setup
```js
const Hazel = require("hazel-wiki").app;
const config = require("./config.default.js");
const StorageProvider = require("hazel-wiki").storageProvider;

let app = new Hazel(config, StorageProvider);
let server = app.server;

server.listen(3000)
```
For a more in-depth tutorial, check out [Getting Started with Hazel](http://wmk.io/posts/hazel-get-started)

## Demo
 Use the full featured online demo : [http://hazel-demo.wmk.io](http://hazel-demo.wmk.io)

## Features

  * Simple markdown editing of documents
  * Configurable storage provider architecture (disk, browser, etc.)
  * Leverages Express for routing and exposes the server for configuration
  * Auto-links to existing documents based on link text
  * Customizable templates utilizing EJS

## Examples

  To view the examples, clone the Hazel repo and install the dependencies:

```bash
$ git clone git://github.com/wkallhof/hazel.git --depth 1
$ cd hazel
$ npm install
```

  Then run the example provided:

```bash
$ node example/server.js
```

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## People

The author of Hazel is [Wade Kallhoff](https://github.com/wkallhof)

Contributions by:
* [Egor Kuryanovich](https://github.com/Sontan)

## License

  [GPL-3.0](LICENSE)

[npm-image]: https://img.shields.io/npm/v/hazel-wiki.svg
[npm-url]: https://npmjs.org/package/hazel-wiki
[downloads-image]: https://img.shields.io/npm/dm/hazel-wiki.svg
[downloads-url]: https://npmjs.org/package/hazel-wiki
[travis-image]: https://img.shields.io/travis/wkallhof/Hazel/master.svg?label=linux
[travis-url]: https://travis-ci.org/wkallhof/Hazel
[appveyor-image]: https://img.shields.io/appveyor/ci/wkallhof/hazel/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/wkallhof/hazel
[coveralls-image]: https://img.shields.io/coveralls/wkallhof/Hazel/master.svg
[coveralls-url]: https://coveralls.io/r/wkallhof/Hazel?branch=master

# Hazel

  Fast, simple, markdown powered wiki knowledge base for [node](http://nodejs.org).

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Windows Build][appveyor-image]][appveyor-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

```js
const Hazel = require("hazel-wiki").app;
const config = require("./config.default.js");
const StorageProvider = require("hazel-wiki").storageProvider;

let app = new Hazel(config, StorageProvider);
let server = app.server;

server.listen(3000)
```

## Installation

```bash
$ npm install hazel-wiki
```

## Features

  * Simple markdown editing of documents
  * Configurable storage provider architecture (disk, browser, etc.)
  * Leverages Express for routing and exposes the server for configuration
  * Auto-links to existing documents based on link text
  * Customizable templates utilizing EJS

## Docs & Community

## Quick Start

## Philosophy

## Examples

## Tests

## People

The author of Hazel is [Wade Kallhoff](https://github.com/wkallhof)

## License

  [GNU3](LICENSE)

[npm-image]: https://img.shields.io/npm/v/hazel-wiki.svg
[npm-url]: https://npmjs.org/package/hazel-wiki
[downloads-image]: https://img.shields.io/npm/dm/hazel-wiki.svg
[downloads-url]: https://npmjs.org/package/hazel-wiki
[appveyor-image]: https://img.shields.io/appveyor/ci/wkallhof/hazel-wiki/master.svg
[appveyor-url]: https://ci.appveyor.com/project/wkallhof/hazel-wiki
[coveralls-image]: https://img.shields.io/coveralls/wkallhof/hazel-wiki/master.svg
[coveralls-url]: https://coveralls.io/r/wkallhof/hazel-wiki?branch=master

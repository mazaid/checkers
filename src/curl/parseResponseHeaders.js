var parseHeader = require('./parseHeader');

// var requestHeadersRegex = /< ([a-zA-Z0-9\-_]+):\s(.*)/g;
var headerRegex = /^< ([-!#-'*+.0-9A-Z^-z|~]+):\s(.*)\r\n/gm;

module.exports = function (logger, raw) {
    var headers = {};

    var matches = raw.stderr.match(headerRegex);

    if (!matches) {
        return headers;
    }

    for (var match of matches) {
        match = match.replace('< ', '');

        console.log(match);

        var parsed = parseHeader(match);

        console.log(parsed);

        headers[parsed.name] = parsed.value;
    }

    return headers;
};

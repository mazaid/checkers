var parseHeader = require('./parseHeader');

var headerRegex = /^> ([-!#-'*+.0-9A-Z^-z|~]+):\s(.*)\r\n/gm;

module.exports = function (logger, raw) {
    var headers = {};

    var matches = raw.stderr.match(headerRegex);

    if (!matches) {
        return headers;
    }

    for (var match of matches) {
        match = match.replace('> ', '');

        var parsed = parseHeader(match);

        headers[parsed.name] = parsed.value;
    }

    return headers;
};

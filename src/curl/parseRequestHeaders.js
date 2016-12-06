var parseHeader = require('./parseHeader');

var requestHeadersRegex = /> (.*:\s.*)/g;

module.exports = function (logger, raw) {
    var headers = {};

    var matches = raw.stderr.match(requestHeadersRegex);

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

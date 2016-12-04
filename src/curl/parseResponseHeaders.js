var requestHeadersRegex = /< (.*:\s.*)/g;

module.exports = function (logger, raw) {
    var headers = {};

    var matches = raw.stderr.match(requestHeadersRegex);

    if (!matches) {
        return headers;
    }

    for (var match of matches) {
        match = match.replace('< ', '');

        var parts = match.split(':');
        parts = parts.map(v => v.trim());

        headers[parts[0]] = parts[1];
    }

    return headers;
};

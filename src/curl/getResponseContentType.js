var contentType = require('content-type');

module.exports = function (logger, responseHeaders) {

    logger.trace('getResponseContentType responseHeaders', responseHeaders);

    for (var key in responseHeaders) {

        if (typeof key !== 'string') {
            continue;
        }

        var lowKey = key.toLowerCase();

        logger.trace('lowKey = ' + key);

        if (lowKey === 'content-type') {
            return contentType.parse(responseHeaders[key]).type;
        }
    }

    return null;
};

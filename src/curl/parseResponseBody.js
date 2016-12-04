var getResponseContentType = require('./getResponseContentType');

module.exports = function (logger, raw, result) {

    var contentType = getResponseContentType(logger, result.responseHeaders);

    logger.debug('checker curl: detected content-type = ' + contentType);

    if (contentType === 'application/json') {
        try {
            return JSON.parse(raw.stdout);
        } catch (e) {
            logger.error('checker curl: content-type == application/json, but body is not JSON');
        }
    }

    return raw.stdout;
};

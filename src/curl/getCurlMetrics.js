var metricsRegex = /curlMetrics=(.*)$/;
var _ = require('lodash');

var parseMetrics = function (logger, matches) {
    try {
        var metrics = JSON.parse(matches[1]);

    } catch (error) {
        throw new Error('checker curl: curlTimings is not a JSON');
    }

    if (!metrics || typeof metrics !== 'object') {
        throw new Error('checker curl: curlTimings is not an object');
    }

    return metrics;
};

var metricsMap = {
    'size_header': 'response.headerSize',
    'size_download': 'response.totalSize',
    'size_request': 'request.totalSize',
    'size_upload': 'request.bodySize',
    'speed_upload': 'uploadSpeed',
    'speed_download': 'downloadSpeed',
    'http_code': 'httpCode'
};

var convertMetrics = function (logger, metrics) {
    var result = {
        timeRaw: {},
        time: {},
        request: {},
        response: {}
    };

    for (var key in metrics) {

        var value = metrics[key];

        value = parseFloat(value.replace(',', '.'));

        if (/^time_/.test(key)) {
            key = key.replace('time_', '');
            result.time[key] = value * 1000;
        } else {
            if (metricsMap[key]) {
                _.set(result, metricsMap[key], value);
            } else {
                // TODO
            }

        }

    }

    return result;
};

var prepareTimings = function (logger, metrics) {
    var raw = metrics.time;

    var time = {};

    metrics.timeRaw = raw;

    time.namelookup = raw.namelookup;
    time.connect = raw.connect - raw.namelookup;
    time.appconnect = (raw.appconnect > 0) ? raw.appconnect - raw.connect : 0;
    time.redirect = raw.redirect;
    time.pretransfer = raw.pretransfer;
    time.ttf = raw.starttransfer;
    time.backend = raw.starttransfer - raw.pretransfer;
    time.download = raw.total - raw.starttransfer;
    time.total = raw.total;

    metrics.time = time;

    return metrics;
};

module.exports = function (logger, stdout) {
    if (!metricsRegex.test(stdout)) {
        throw new Error('checker curl: no curlMetrics in stdout');
    }

    var matches = metricsRegex.exec(stdout);

    if (!matches[1]) {
        throw new Error('checker curl: no curlMetrics by regex in stdout');
    }

    logger.trace('checker curl: raw metrics' + matches[1]);

    var metrics = parseMetrics(logger, matches);

    metrics = convertMetrics(logger, metrics);

    metrics = prepareTimings(logger, metrics);

    stdout = stdout.replace(metricsRegex, '');

    return {
        stdout: stdout,
        metrics: metrics
    };
};

var curlTimingFormat = {
    time_namelookup: '%{time_namelookup}',
    time_connect: '%{time_connect}',
    time_appconnect:  '%{time_appconnect}',
    time_pretransfer: '%{time_pretransfer}',
    time_redirect: '%{time_redirect}',
    time_starttransfer: '%{time_starttransfer}',
    time_total: '%{time_total}',

    size_header: '%{size_header}',
    size_download: '%{size_download}',
    speed_download: '%{speed_download}',

    size_request: '%{size_request}',
    size_upload: '%{size_upload}',
    speed_upload: '%{speed_upload}',

    http_code: '%{http_code}',

    ssl_verify_result: '%{ssl_verify_result}',

    num_redirects: '%{num_redirects}'
};

curlTimingFormat = '\n\n\ncurlTimings=' + JSON.stringify(curlTimingFormat);

var getCurlMetrics = require('./getCurlMetrics');
var parseRequestHeaders = require('./parseRequestHeaders');
var parseResponseHeaders = require('./parseResponseHeaders');
var parseResponseBody = require('./parseResponseBody');

module.exports = {
    name: 'curl',

    type: 'exec',

    defaultData: {
        method: 'GET',
        url: null
    },

    prepare: function (logger, data) {

        return new Promise((resolve, reject) => {
            var args = [];

            args.push('--silent');
            args.push('--verbose');
            args.push('--request ' + data.method);
            args.push(`--write-out '${curlTimingFormat}'`);
            args.push(`--user-agent 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/999'`);
            args.push(`'${data.url}'`);

            resolve({
                command: 'curl',
                args: args
            });
        });

    },

    parse: function (logger, raw) {

        return new Promise((resolve, reject) => {
            if (raw.error) {
                return reject(new Error((raw.error)));
            }

            var result = {};

            if (typeof raw.stdout !== 'string') {
                return reject(new Error('checker curl: rawResult.stdout should be a string'));
            }

            try {
                var metricResult = getCurlMetrics(logger, raw.stdout);
            } catch (error) {
                return reject(error);
            }

            raw.stdout = metricResult.stdout;

            result.metrics = metricResult.timings;

            result.requestHeaders = parseRequestHeaders(logger, raw);
            result.responseHeaders = parseResponseHeaders(logger, raw);
            result.responseBody = parseResponseBody(logger, raw, result);

            resolve(result);
        });

    },

    analyze: function (logger, data, result) {

        return new Promise((resolve, reject) => {

            if (!result) {
                logger.debug('no exec result', result);

                return resolve({status: 'fail', message: 'empty exec result'});
            }

            var status = {
                status: 'pass',
                message: `http code = ${result.code}, response time = ${result.responseTime} ms`,
                responseTime: result.responseTime
            };

            logger.debug('set status', status);

            resolve(status);


        });

    }
};

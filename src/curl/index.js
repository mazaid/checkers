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

curlTimingFormat = '\n\n\ncurlMetrics=' + JSON.stringify(curlTimingFormat);

var getCurlMetrics = require('./getCurlMetrics');
var parseRequestHeaders = require('./parseRequestHeaders');
var parseResponseHeaders = require('./parseResponseHeaders');
var parseResponseBody = require('./parseResponseBody');

module.exports = {
    name: 'curl',

    type: 'exec',

    defaultData: {
        method: 'GET',
        url: null,
        saveResponseBody: false,
        httpCodes: [200],
        responseTimeWarn: null,
        responseTimeFail: null
    },

    prepare: function (logger, data) {

        return new Promise((resolve, reject) => {
            var args = [];

            if (!data.url) {
                return reject(new Error('data.url should be a valid http uri'));
            }

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

    parse: function (logger, raw, data) {

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

            result.metrics = metricResult.metrics;

            result.code = result.metrics.httpCode;

            result.requestHeaders = parseRequestHeaders(logger, raw);
            result.responseHeaders = parseResponseHeaders(logger, raw);

            result.responseBody = null;

            if (data.saveResponseBody) {
                result.responseBody = parseResponseBody(logger, raw, result);
            }

            resolve(result);
        });

    },

    analyze: function (logger, data, result) {

        return new Promise((resolve, reject) => {

            if (!result) {
                logger.debug('no exec result', result);
                return resolve({
                    status: 'fail',
                    message: 'empty exec result'
                });
            }

            var status = {
                code: result.code,
                status: 'pass',
                message: `http code = ${result.code}, response time = ${result.metrics.time.total} ms`,
                metrics: {
                    time: result.metrics.time,
                    request: result.metrics.request,
                    response: result.metrics.response
                }
            };

            if (data.httpCodes.indexOf(result.code) === -1) {
                status.status = 'fail';
                status.message = `unexpected http code = ${result.code} (allowed http codes = ${data.httpCodes.join(',')})`;
                return resolve(status);
            }

            if (
                typeof data.responseTimeWarn === 'number' &&
                status.metrics.time.total >= data.responseTimeWarn
            ) {
                status.status = 'warn';
                status.message = `response time = ${status.metrics.time.total}ms ( warning on ${data.responseTimeWarn}ms )`;
            }

            if (
                typeof data.responseTimeFail === 'number' &&
                status.metrics.time.total >= data.responseTimeFail
            ) {
                status.status = 'fail';
                status.message = `response time = ${status.metrics.time.total}ms ( fail on ${data.responseTimeFail}ms )`;
            }

            logger.debug('set status', status);

            resolve(status);

        });

    }
};

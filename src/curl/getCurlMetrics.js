var timingsRegex = /curlTimings=(.*)$/;

var convertTimings = function (timings) {
    for (var key in timings) {
        timings[key] = parseFloat(timings[key].replace(',', '.'));
    }

    return timings;
};

var parseTimings = function (matches) {
    try {
        var timings = JSON.parse(matches[1]);

    } catch (error) {
        throw new Error('checker curl: curlTimings is not a JSON');
    }

    if (!timings || typeof timings !== 'object') {
        throw new Error('checker curl: curlTimings is not an object');
    }

    return timings;
};

module.exports = function (logger, stdout) {
    if (!timingsRegex.test(stdout)) {
        throw new Error('checker curl: no curlTimings in stdout');
    }

    var matches = timingsRegex.exec(stdout);

    if (!matches[1]) {
        throw new Error('checker curl: no curlTimings by regex in stdout');
    }

    logger.trace('checker curl: raw timings' + matches[1]);

    var timings = parseTimings(matches);

    timings = convertTimings(timings);

    stdout = stdout.replace(timingsRegex, '');

    return {
        stdout: stdout,
        timings: timings
    };
};

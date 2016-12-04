module.exports = {
    name: 'ping',

    type: 'exec',

    defaultData: {
        interval: 1,
        count: 3,

        // analyzer params
        // analyzer: {
        //     'avg <=':
        // }

    },

    prepare: function (logger, data) {

        return new Promise((resolve, reject) => {
            var args = [];

            args.push('-i ' + data.interval);
            args.push('-c ' + data.count);

            args.push(data.host);

            logger.debug('test');

            resolve({
                command: 'ping',
                args: args
            });
        });

    },

    parse: function (logger, rawResult) {

        return new Promise((resolve, reject) => {
            if (!rawResult.stdout) {
                return reject(new Error('no stdout'));
            }

            var splitted = rawResult.stdout.split('\n');

            var pingItemRegex = /.*: icmp_seq=\d+ ttl=\d+ time=(\d+\.\d+)\sms/;

            var pings = [];

            for (var line of splitted) {
                var matches = pingItemRegex.exec(line);

                if (matches) {
                    pings.push(Number(matches[1]));
                }
            }

            resolve(pings);
        });

    },

    analyze: function (logger, data, result) {

        return new Promise((resolve, reject) => {

            if (!result) {
                return resolve({status: 'fail', message: 'empty data'});
            }

            var avg = 0;

            for (var time of result) {
                avg += time;
            }

            avg = avg / result.length;

            avg = Number(avg.toFixed(2));

            if (typeof data.analyzer !== 'object') {
                return resolve({
                    status: 'pass',
                    avg: avg
                });
            }

            logger.debug(avg, data, data.analyzer['avg <='], avg >= data.analyzer['avg <=']);

            if (
                typeof data.analyzer['avg <='] === 'number' &&
                avg > data.analyzer['avg <=']
            ) {
                resolve({
                    status: 'fail',
                    message: `avg response time = ${avg} ms ( > ${data.analyzer['avg <=']} ms)`,
                    avg: avg
                });
            } else {
                resolve({
                    status: 'pass',
                    message: `avg response time = ${avg} ms`,
                    avg: avg
                });
            }
        });

    }
};

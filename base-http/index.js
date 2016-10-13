module.exports = {
    name: 'base-http',

    type: 'http',

    defaultData: {
        method: 'GET',
        'responseTime <=': 1000
    },

    prepare: function (logger, data) {

        return new Promise((resolve, reject) => {
            var args = [];

            resolve({
                method: data.method,
                url: data.url
            });
        });

    },

    parse: function (logger, rawResult) {

        return new Promise((resolve, reject) => {
            if (rawResult.error) {
                return reject(new Error(rawResult.error.message));
            }

            resolve(rawResult);
        });

    },

    analyze: function (logger, data, result) {

        return new Promise((resolve, reject) => {
            if (!result) {
                return resolve({status: 'fail', message: 'empty data'});
            }

            if (result.responseTime > data['responseTime <=']) {
                resolve({
                    status: 'fail',
                    message: `response time = ${result.responseTime} ms ( > ${data['responseTime <=']} ms)`,
                    avg: result.responseTime
                });
            } else {
                resolve({
                    status: 'pass',
                    avg: result.responseTime
                });
            }
        });

    }
};

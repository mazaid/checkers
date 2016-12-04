module.exports = {
    name: 'http',

    type: 'http',

    defaultData: {
        method: 'GET',
        'responseTime <=': null
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
                return reject(new Error((rawResult.error)));
            }

            resolve(rawResult);
        });

    },

    analyze: function (logger, data, result) {

        return new Promise((resolve, reject) => {

            if (!result) {
                logger.debug('no exec result', result);

                return resolve({status: 'fail', message: 'empty result'});
            }

            var status = {
                status: 'pass',
                message: `http code = ${result.code}, response time = ${result.responseTime} ms`,
                responseTime: result.responseTime
            };

            if (data['responseTime <=']) {

                if (result.responseTime > data['responseTime <=']) {
                    status.status = 'fail';
                    status.message += ` ( > ${data['responseTime <=']} ms)`;

                } else {
                    status.status = 'pass';
                    status.message += ` ( <= ${data['responseTime <=']} ms)`;
                }

            }

            logger.debug('set status', status);

            resolve(status);


        });

    }
};

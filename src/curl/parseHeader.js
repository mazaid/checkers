module.exports = function (header) {
    var parts = header.match(/(.*):\s(.*)/);

    return {
        name: parts[1].trim(),
        value: parts[2].trim()
    };
};

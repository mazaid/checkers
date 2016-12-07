module.exports = function (header) {

    var name = header.substr(0, header.indexOf(':'));

    var value = header.substr(header.indexOf(' ') + 1);

    return {
        name: name.trim(),
        value: value.trim()
    };
};

var multimatch = require('multimatch');

module.exports = function (options) {

    return function (files, metalsmith, done) {

        var metadata = metalsmith.metadata();

        metadata.sources =  (metadata.sources || {});

        Object.keys(files)
            .filter(function (p) {
                return multimatch(p, options.pattern).length > 0
            })
            .forEach(function (p) {
                metadata.sources[p] = files[p].contents;
            });

        return process.nextTick(done);
    }

};

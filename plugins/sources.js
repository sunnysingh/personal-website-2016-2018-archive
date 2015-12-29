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

                // Get file content
                var content = files[p].contents.toString();

                // If it's an SVG file, the <?xml> can be stripped out
                content = content.replace(/\<\?xml.+\?\>/g, '');

                // Store in metadata
                metadata.sources[p] = content;

            });

        return process.nextTick(done);
    }

};

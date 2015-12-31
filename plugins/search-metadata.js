'use strict';

const multimatch = require('multimatch');

module.exports = function (options) {

    return files => {

        let data = {};

        Object.keys(files)
            .filter(p => {
                return multimatch(p, options.pattern).length > 0;
            })
            .forEach(filename => {
                // Add metadata
				data[filename] = {
                    title:       files[filename].title,
                    url:         files[filename].url,
                    description: files[filename].description,
                };
            });

        // Create "search-metadata.json"
        let contents =  new Buffer(JSON.stringify(data));
        files['search-metadata.json'] = {contents: contents};

    };

};

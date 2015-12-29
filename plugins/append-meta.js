'use strict';

var multimatch = require('multimatch');

module.exports = function (options) {

    return files => {

        Object.keys(files)
            .filter(p => {
                return multimatch(p, options.pattern).length > 0;
            })
            .forEach(filename => {
                if (!files[filename].url) {

                    let url = filename.replace(options.urlPattern, '');
                    let data = options.data;

                    files[filename].url = '/'+url;

                    if (data.length) {
                        data.forEach(item => {
                            let key = Object.keys(item)[0];
                            files[filename][key] = item[key];
                        });
                    }

                }
            });

    };

};

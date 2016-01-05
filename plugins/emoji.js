'use strict';

const emojione = require('emojione');

module.exports = options => {

	// TODO: Pass options to emojione
	// emojione.imageType = 'svg';
	// emojione.sprites = true;
	// emojione.imagePathSVGSprites = './../assets/sprites/emojione.sprites.svg';

    return (files, metalsmith, done) => {

		setImmediate(done);

        Object.keys(files)

            .forEach(file => {
                let contents = files[file].contents.toString();
				let emojifiedContents = emojione.shortnameToImage(contents);
				files[file].contents = new Buffer(emojifiedContents);
            });

    };

};

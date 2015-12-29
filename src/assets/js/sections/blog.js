
/*
|--------------------------------------------------------------------------
| Section: Blog
|--------------------------------------------------------------------------
|
| Page-specifc scripts for blog section.
|
*/

import app from 'ampersand-app';
import progress from 'nprogress';
import loadScript from '../load-script';

// Comments

let disqusLoaded = false;

app.on('page:ready', () => {

    let comments    = document.querySelector('#comments');
    let commentsBtn = document.querySelector('[data-comments-btn]');

    if (!comments) {
        return;
    }

	let disqusTitle      = comments.getAttribute('data-disqus-title');
	let disqusUrl        = comments.getAttribute('data-disqus-url');
	let disqusIdentifier = comments.getAttribute('data-disqus-identifier');

    // Default identifier becomes the URL
	if (disqusIdentifier == '') {
		disqusIdentifier = disqusUrl;
	}

	// Disqus expects this config variable on initial load
	let disqus_config = () => {
        this.page.title      = disqusTitle;
        this.page.url        = disqusUrl;
        this.page.identifier = disqusIdentifier;
    };

	commentsBtn.addEventListener('click', () => {
        if (!disqusLoaded) {

            progress.start();
            commentsBtn.setAttribute('disabled', 'disabled');

            // Initial load of Disqus embed script
            loadScript('//'+metadata.services.disqus.shortname+'.disqus.com/embed.js', () => {
                disqusLoaded = true;
                progress.done();
                commentsBtn.classList.add('hidden');
            });

        } else {

            // On new ajaxified page loads, reload the comments thread
            DISQUS.reset({
                reload: true,
                config: disqus_config,
            });

            commentsBtn.classList.add('hidden');

        }
    });

});

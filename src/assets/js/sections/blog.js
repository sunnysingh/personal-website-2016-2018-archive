
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
import swal from 'sweetalert';
import Clipboard from 'clipboard';
import loadScript from '../load-script';

// Subscribe

app.on('page:ready', () => {

    let subscribe  = document.querySelector('[data-subscribe]');

    if (!subscribe) {
        return;
    }

    let url = subscribe.getAttribute('data-subscribe');
    let readers = `
        <ul class="subscribe-readers">
            <li>
                <a class="btn" href="http://feedly.com/i/subscription/feed/${url}" target="_blank">
                    feedly
                </a>
            </li>
            <li>
                <a class="btn" href="http://digg.com/reader/search/${url}" target="_blank">
                    Digg Reader
                </a>
            </li>
            <li>
                <a class="btn" href="https://kouio.com/subscribe/?url=${url}" target="_blank">
                    Kouio RSS Reader
                </a>
            </li>
            <li>
                <a class="btn" href="https://wordpress.com/following/edit/?follow=${url}" target="_blank">
                    WordPress.com Reader
                </a>
            </li>
        </ul>
        <div class="subscribe-direct">
            <label>Or copy the RSS feed URL:</label>
            <span id="rss-container" class="subscribe-direct-input has-tooltip has-tooltip-top" aria-label="Copy to clipboard">
                <input id="rss-input" type="text" value="${url}" readonly />
            </span>
        </div>
    `;
    let mod = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'cmd' : 'ctrl';

    subscribe.addEventListener('click', event => {

        event.preventDefault();

        swal({
            type: 'info',
            title: 'Choose Your Reader',
            text: readers,
            html: true,
            confirmButtonText: 'Close',
            allowOutsideClick: true,
        });

        let rssContainer = document.querySelector('#rss-container');
        let rssInput = document.querySelector('#rss-input');

        let clipboard = new Clipboard(rssInput, {
            text: trigger => {
                return trigger.value;
            },
        });

        // Fallback
        rssInput.addEventListener('click', event => {
            rssInput.select();
        });

        clipboard.on('success', event => {
            rssContainer.setAttribute('aria-label', 'Copied!');
            clipboard.destroy();
        });

        clipboard.on('error', event => {
            rssContainer.setAttribute('aria-label', 'Press '+mod+' + c to copy');
            clipboard.destroy();
        });

    });

});

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
	window.disqus_config = () => {
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

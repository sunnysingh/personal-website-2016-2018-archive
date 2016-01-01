
/*
|--------------------------------------------------------------------------
| Analytics
|--------------------------------------------------------------------------
|
| Loads the Google Analytics script and tracks page views.
|
*/

import app from 'ampersand-app';
import loadScript from './load-script';

let gaLoaded = false;

app.on('page:ready', () => {

	if (metadata.site.env != 'prod') return;

	if (!gaLoaded) {
		loadScript('//www.google-analytics.com/analytics.js', () => {
			gaLoaded = true;
			window.ga = window.ga || function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
			ga('create', metadata.services.google_analytics.id, 'auto');
			ga('send', 'pageview');
		});
	} else {
		ga('send', 'pageview');
	}

});

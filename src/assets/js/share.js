import app from 'ampersand-app';
import socialshares from 'socialshares';

app.on('page:ready', () => {

	let shareButtons = document.querySelectorAll('.socialshares');
	let shareUrl;

	if (shareButtons) {

		socialshares.mount();

	}

});

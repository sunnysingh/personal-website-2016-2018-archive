import app from 'ampersand-app';

app.on('page:ready', () => {

	let shareButtons = document.querySelectorAll('.share-btn');
	let shareUrl;

	if (shareButtons) {

		for (let button of shareButtons) {

			button.addEventListener('click', event => {

				let width  = 650;
				let height = 450;

				event.preventDefault();

				shareUrl = button.href;

				// Dialog
				window.open(shareUrl, 'Share Dialog', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width='+width+',height='+height+',top='+(screen.height/2-height/2)+',left='+(screen.width/2-width/2));

			});

		};

	}

});

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
|
| Site search.
|
*/

import app from 'ampersand-app';
import lunr from 'lunr';
import request from 'superagent';

// Setup:
// Initiates two parallel Ajax requests and triggers the
// search:ready event when both requests have finished.

let searchIndex = false;
let searchMeta  = false;

let searchReady = callback => {
	if (searchIndex && searchMeta) {
		callback(searchIndex, searchMeta);
	} else {
		app.on('search:ready', search => {
			callback(search.index, search.meta);
		});
	}
};

request.get('/search.json').end((error, response) => {

	if (error) return;

	searchIndex = lunr.Index.load(response.body);

	// If other request has finished
	if (searchMeta) {
		app.trigger('search:ready', {
			index: searchIndex,
			meta:  searchMeta
		});
	}

});

request.get('/search-metadata.json').end((error, response) => {

	if (error) return;

	searchMeta = response.body;

	// If other request has finished
	if (searchIndex) {
		app.trigger('search:ready', {
			index: searchIndex,
			meta:  searchMeta
		});
	}

});

// Search

app.on('page:ready', () => {

	let search = terms => {
		let resultsContainer = document.querySelector('#search-results');

		resultsContainer.innerHTML = `
			<div class="search-loading">Loading...</div>
		`;

		searchReady((index, meta) => {

			let results = index.search(terms);

			if (!results.length) {
				resultsContainer.innerHTML = `
					<div class="search-empty">No articles found for those search terms.</div>
				`;
				return;
			}

			resultsContainer.innerHTML = `
				<div class="search-results-list" id="search-results-list"></div>
			`;

			let listContainer = document.querySelector('#search-results-list');

			results.forEach(result => {

				let data = meta[result.ref]
				let item = listContainer.appendChild(document.createElement('div'));

				item.outerHTML = `
					<article class="media-article">
						<header>
							<h2 class="media-article-heading">
								<a href="${data.url}">
									${data.title}
								</a>
							</h2>
						</header>
						<div class="media-article-content">
							<p>${data.description}</p>
						</div>
					</article>
				`;

			});

			// Ajaxify search links
			app.trigger('page:reajaxify');
		});
	};

	let forms = document.querySelectorAll('[data-search]');

	for (let form of forms) {

		form.addEventListener('submit', event => {

			let terms = form.querySelector('input').value;

			event.preventDefault();

			if (terms == '') {
				return;
			}

			app.on('page:ready', page => {
				if (page.section != 'search') return;

				search(terms);
			});

			if (location.pathname == '/search') {
				search(terms);
				return;
			}
			
			app.trigger('page:navigate', '/search');

		});

	}

});

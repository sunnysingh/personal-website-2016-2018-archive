
/*
|--------------------------------------------------------------------------
| Page Loads via Ajax
|--------------------------------------------------------------------------
|
| Intercept clicks and load content dynamically.
|
*/

import app from 'ampersand-app';
import domready from 'domready';
import request from 'superagent';
import progress from 'nprogress';

// page:ready event is binded to domready
// as well as when the page loads via ajax
domready(() => {
    app.trigger('page:ready');
});

(() => {

    // Detect browser support for pushState
    if (!(window.history && window.history.pushState)) return;

    domready(() => {

        // Cache body element
        let bodyElement = document.querySelector('body');

        // Element where cover will be injected
        let coverElement = bodyElement.querySelector('#cover');

        // Video element that will be played/paused between navigation
        let videoElement= bodyElement.querySelector('#video');

        // Element where content will be injected
        let contentElement = bodyElement.querySelector('#content');

        // Only target appropriate relative links:
        // Ignore URLs with protocols, mailto, or #
        // Ignore <a>'s with target attribute (even _self, which allows for disabling ajaxify)
        let linksSelector = 'a:not([href*="//"]):not([href^="mailto"]):not([href^="#"]):not([target])';

        // Get current section
        let section = bodyElement.getAttribute('data-section');

        // Get current subsection
        let subsection = bodyElement.getAttribute('data-subsection');

        // Get current page data to allow resetting state
        let initialPageData = {
            title:      document.title,
            cover:      coverElement.innerHTML,
            content:    contentElement.innerHTML,
            section:    section,
            subsection: subsection,
        };

        // Only play video on home section
        let updateVideoState = (section) => {
            if (section === 'home') {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        };

        // Declare what gets updated in the page
        let updatePage = (data => {

            document.title = data.title;

            bodyElement.classList.remove('section-'+section);
            bodyElement.classList.remove('subsection-'+subsection);
            bodyElement.classList.add('section-'+data.section);
            bodyElement.classList.add('subsection-'+data.subsection);
            bodyElement.setAttribute('data-section', data.section);
            bodyElement.setAttribute('data-subsection', data.subsection);

            updateVideoState(data.section);

            coverElement.innerHTML = data.cover;
            contentElement.innerHTML = data.content;

            section = data.section;

        });

        let loadPage = (pageUrl, event, callback) => {

            if (event) event.preventDefault();

            progress.start();

            request.get(pageUrl).end((error, response) => {

                // Handle errors:
                // These don't contain the #content element,
                // so manually redirect to that page.
                if (error) {
                    location.href = pageUrl;
                    return;
                }

                // Create a virtual DOM of the response that we can query
                let responseHtml       = document.createElement('html');
                responseHtml.innerHTML = response.text

                // Retrieve necessary data from response
                let responseTitle   = responseHtml.querySelector('title').textContent;
                let responseCover   = responseHtml.querySelector('#cover').innerHTML;
                let responseContent = responseHtml.querySelector('#content').innerHTML;
                let responseSection = responseHtml.querySelector('body').getAttribute('data-section');
                let responseSubsection = responseHtml.querySelector('body').getAttribute('data-subsection');

                // Update the page
                updatePage({
                    title:      responseTitle,
                    cover:      responseCover,
                    content:    responseContent,
                    section:    responseSection,
                    subsection: responseSubsection,
                });

                // Update history
                history.pushState({
                    title:   responseTitle,
                    cover:   responseCover,
                    content: responseContent,
                    section: responseSection,
                }, null, pageUrl);

                window.scrollTo(0, 0);

                // Refresh click handlers
                ajaxifyLinks(contentElement.querySelectorAll(linksSelector));

                progress.done();

                if (callback) callback();

                app.trigger('page:ready');

            });

        };

        // Bind clicks
        let ajaxifyLinks = elements => {
            for (let link of elements) {
                link.addEventListener('click', event => {
                    // User is trying to open link in a new tab
                    if (event.metaKey || event.ctrlKey) {
                        return;
                    }

                    loadPage(link.getAttribute('href'), event, () => {
                        link.blur();
                    });
                });
            }
        };

        // Bind events
        app.on('page:navigate', (pageUrl) => {
            loadPage(pageUrl);
        });

        // Browser navigation support
        window.addEventListener('popstate', function (event) {
            if (event.state === null) {
                updatePage(initialPageData);
                return;
            }

            updatePage(event.state);
        });

        // Initialize
        updateVideoState(section);
        ajaxifyLinks(document.querySelectorAll(linksSelector));

    });

})();

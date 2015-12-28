
/*
|--------------------------------------------------------------------------
| Keyboard Shortcuts
|--------------------------------------------------------------------------
|
| Bind shortcuts to page navigation.
|
*/

import app from 'ampersand-app';
import domready from 'domready';
import keyboard from 'mousetrap';
import swal from 'sweetalert';

domready(() => {

    let mod = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'cmd' : 'ctrl';
    let text = `
        <ul class="shortcuts">
            <li>
                <span class="shortcuts-key"><kbd>?</kbd></span>
                <span class="shortcuts-desc">Shortcuts menu</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>/</kbd></span>
                <span class="shortcuts-desc">Focus on search field</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>g then h</kbd></span>
                <span class="shortcuts-desc">Go to home page</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>g then a</kbd></span>
                <span class="shortcuts-desc">Go to about page</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>g then p</kbd></span>
                <span class="shortcuts-desc">Go to projects page</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>g then c</kbd></span>
                <span class="shortcuts-desc">Go to contact page</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>g then b</kbd></span>
                <span class="shortcuts-desc">Go to articles page</span>
            </li>
            <li>
                <span class="shortcuts-key"><kbd>${mod} + enter</kbd></span>
                <span class="shortcuts-desc">Submit the form</span>
            </li>
        </ul>
    `;
    let search = document.querySelector('#search');

    keyboard.bind('?', () => {
        swal({
            type: 'info',
            title: 'Keyboard Shortcuts',
            text: text,
            html: true,
            allowOutsideClick: true,
        })
    });

    keyboard.bind('/', event => {
        event.preventDefault();
        search.focus();
    });

    keyboard(search).bind('escape', () => {
        search.blur();
    });

    keyboard.bind('g h', () => {
        app.trigger('page:navigate', '/');
    });

    keyboard.bind('g a', () => {
        app.trigger('page:navigate', '/about');
    });

    keyboard.bind('g p', () => {
        app.trigger('page:navigate', '/projects');
    });

    keyboard.bind('g c', () => {
        app.trigger('page:navigate', '/contact');
    });

    keyboard.bind('g b', () => {
        app.trigger('page:navigate', '/blog');
    });

    keyboard.bind('up up down down left right left right b a enter', event => {
        event.preventDefault();
        swal({
            type: 'success',
            title: 'Power up!',
            text: 'Nice, you entered the Konami Code! There is actually no power up, but you should totally screenshot this message and let me know about it :)',
            allowOutsideClick: true,
        });
    });

});


/*
|--------------------------------------------------------------------------
| Section: Contact
|--------------------------------------------------------------------------
|
| Page-specifc scripts for contact section.
|
*/

import app from 'ampersand-app';
import getFormData from 'get-form-data';
import request from 'superagent';
import progress from 'nprogress';
import swal from 'sweetalert';
import keyboard from 'mousetrap';

app.on('page:ready', () => {

    let form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    let endpoint     = form.getAttribute('action');
    let errorMsg     = form.getAttribute('data-error-msg');
    let errorBtn     = form.getAttribute('data-error-btn');
    let successMsg   = form.getAttribute('data-success-msg');
    let messageInput = form.querySelector('#message');
    let emailInput   = form.querySelector('#email');

    // Send the form
    let send = event => {

        if (event) event.preventDefault();

        let input = getFormData(form, {trim: true});

        if (input.message == '' || input.email == '') {
            swal({
                type: 'warning',
                title: 'Warning',
                text: 'Please fill out all of the fields.',
                allowOutsideClick: true,
            });
            return;
        }

        progress.start();

        request
            .post(endpoint)
            .accept('json')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(input)
            .end((error, response) => {
                progress.done();

                if (error) {
                    swal({
                        type:              'error',
                        title:             'Error',
                        text:              errorMsg,
                        confirmButtonText: errorBtn,
                        showCancelButton:  true,
                        cancelButtonText:  'Close',
                        allowOutsideClick: true,
                    }, () => {
                        // Open mail client with prefilled data
                        window.open('mailto:'+input.to+'?subject='+encodeURIComponent(input._subject)+'&body='+encodeURIComponent(input.message))
                    });
                    return;
                }

                messageInput.value = '';
                emailInput.value   = '';

                swal({
                    type:              'success',
                    title:             'Sent',
                    text:              successMsg,
                    allowOutsideClick: true,
                });
        });

    };

    // Bind keyboard shortcut
    keyboard(form).bind('mod+enter', () => {
        send();
    });

    // Bind to form's native submit
    form.addEventListener('submit', send);

});

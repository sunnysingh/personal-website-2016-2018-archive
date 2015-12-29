/**
 * Asynchronous script loader.
 * Based on: https://gist.github.com/devfred/2002263
 */

let load = (url, callback) => {

	let script = document.createElement('script');

    script.src   = url;
    script.type  = 'text/javascript';
    script.async = 'true';

	script.onload = script.onreadystatechange = function(){
		if (this.readyState && this.readyState != 'complete' && this.readyState != 'loaded') {
			return;
		}
		if (callback) callback();
	};

	let element = document.getElementsByTagName('script')[0];
    element.parentNode.insertBefore(script, element);

};

export default load;

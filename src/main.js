var Promise = require('promise-polyfill');
require('whatwg-fetch');

if (!window.Promise) {
  window.Promise = Promise;
}

var options = (typeof contidioOptions !== "undefined") ? contidioOptions : {};

var url = options.url ? options.url : '';

fetch(url, {
  headers: {
    'x-contidio-sdk': '1.0-JS'
  }
}).then(function (response) {
  return response.json();
}).then(function (json) {

  var renderer = new Renderer($, json, options);

  renderer.init();

});

var $ = require('domtastic');


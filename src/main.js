var Promise = require('promise-polyfill');
require('whatwg-fetch');

if (!window.Promise) {
  window.Promise = Promise;
}

var url = 'https://mdidx-staging.contidio.com:31446/api/v1/brands/3000000A2/childs/anonymous/?flags=268435456&startIndex=0&count=24&orderBy=1&orderDirection=1&locale=de&types=1,2';

fetch(url, {
  headers: {
    'x-contidio-sdk': '1.0-JS'
  }
}).then(function (response) {
  return response.json();
}).then(function (json) {

  json.entity.forEach(function (entity) {
    $('.contidio-widget').append('<p>'+entity.uuid+'</p>');
  });

});

var $ = require('domtastic');


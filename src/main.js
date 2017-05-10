var Promise = require('promise-polyfill');
var $ = require('domtastic');
require('whatwg-fetch');

if (!window.Promise) {
  window.Promise = Promise;
}

function ContidioWidget(){

  this.defaultOptions = {
    container: ".contidio-widget",
    itemClass: "contidio-item"
  };

  this.mergeOptions = function(obj1,obj2){
      var obj3 = {};
      for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
      for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
      return obj3;
  };

  this.options = (typeof contidioOptions !== "undefined") ? this.mergeOptions(this.defaultOptions,contidioOptions) : this.defaultOptions;
  this.items = [];

  this.init = function(){

    var options = this.options;
    var that = this;

    var url = options.url ? options.url : '';

    fetch(url, {
      headers: {
          'x-contidio-sdk': '1.0-JS'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (json) {

      that.extractItems(json);

      var renderer = new Renderer($, options);

      var $itemList = $("<div class='contidio-item-list'></div>");

      for(var i = 0; i < that.items.length; i++) {
          $itemList.append(renderer.renderListItem(that.items[i]));
      }

      $(options.container).append($itemList);

      if(renderer.resize){

        renderer.resize();
        that.addEvent(window, "resize", function(){
            renderer.resize();
        });

      }

    });
  };

  this.extractItems = function(json) {

    var that = this;

    json.entity.forEach(function (entity) {

      var item = {
        uuid: entity.uuid,
        name: entity.name ? entity.name : entity.uuid,
        type: that.defineType(entity.type),
        previewImage: that.getPreviewImage(entity)
      };

      if(entity.workingSetBinaryType){
        item.binaryType = that.defineBinaryType(entity.workingSetBinaryType);
      }

      that.items.push(item);
    });
  };

  this.defineType = function(type) {

    /* TODO: switch to constants */

    switch(type) {
      case 1:
        return "collection";
      case 2:
        return "asset";
      default:
        return "undefined";
    }

  };

  this.defineBinaryType = function(binaryType) {

    /* TODO: switch to constants */

    switch(binaryType) {
      case 1:
          return "image";
      case 2:
          return "audio";
      case 3:
          return "video";
      case 4:
          return "document";
      default:
          return "undefined";
    }

  };

  this.getPreviewImage = function(entity) {
      var indexToUse = -1;

      if(entity.workingSetBinaryType == 2) {

          if(entity.previewBinarySet[0].calculatedBinary.length > 1) {

              for(var i = 0; i < entity.previewBinarySet[0].calculatedBinary.length; i++) {
                  if(entity.previewBinarySet[0].calculatedBinary[i].binaryPurpose == 19000 &&
                      entity.previewBinarySet[0].calculatedBinary[i].width >= 560
                  ){
                      indexToUse = i;
                  }
              }
          }

      } else {
          indexToUse = 0;
      }

      if(indexToUse > -1) {
        return entity.previewBinarySet[0].calculatedBinary[indexToUse].downloadLink;
      } else {
        return false;
      }

  };

  this.addEvent = function(object, type, callback) {
      if (object == null || typeof(object) == 'undefined') return;
      if (object.addEventListener) {
          object.addEventListener(type, callback, false);
      } else if (object.attachEvent) {
          object.attachEvent("on" + type, callback);
      } else {
          object["on"+type] = callback;
      }
  };

}

var cw = new ContidioWidget();
cw.init();



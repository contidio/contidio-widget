function ContidioWidget() {

  this.defaultOptions = {
    container: ".contidio-widget",
    itemClass: "contidio-item"
  };

  this.mergeOptions = function (obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
      obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
      obj3[attrname] = obj2[attrname];
    }
    return obj3;
  };

  this.options = (typeof contidioOptions !== "undefined") ? this.mergeOptions(this.defaultOptions, contidioOptions) : this.defaultOptions;
  this.items = [];

  this.init = function () {

    var Promise = require('promise-polyfill');

    var $;

    if (typeof jQuery === 'undefined') {
      $ = require('domtastic');
    } else {
      $ = jQuery;
    }

    require('whatwg-fetch');

    if (!window.Promise) {
      window.Promise = Promise;
    }

    var url = this.options.url ? this.options.url : '';

    this.fetchUrl(url, $);

  };

  this.fetchUrl = function (url, $) {

    var options = this.options;
    var renderer = new Renderer(options, $);
    var that = this;

    fetch(url, {
      headers: {
        'x-contidio-sdk': '1.0-JS'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (json) {

      if (json.entity) {

        that.extractItems(json);

        var $itemList = $("<div class='contidio-item-list'></div>");

        for (var i = 0; i < that.items.length; i++) {
          $itemList.append(renderer.renderListView(that.items[i]));
        }

        $(options.container).append($itemList);

      } else {

        that.extractItems(json);

        $(options.container).append(renderer.renderDetailView(that.items[0]));
      }

      if (renderer.resize) {

        renderer.resize();
        that.addEvent(window, "resize", function () {
          renderer.resize();
        });

      }

    });
  };

  this.extractItems = function (json) {

    var that = this;

    if (json.entity) {
      json.entity.forEach(function (entity) {
        that.items.push(that.getItemData(entity, false));
      });
    } else {
      that.items.push(that.getItemData(json, true));
    }

  };

  this.getItemData = function (entity, isDetail) {
    var item = {
      uuid: entity.uuid,
      name: entity.name ? entity.name : entity.uuid,
      description: entity.description || false,
      editorial: entity.editorial || false,
      type: this.defineType(entity.type)
    };

    if (entity.workingSetBinaryType) {
      item.binaryType = this.defineBinaryType(entity.workingSetBinaryType);
    }

    if (entity.resolvedInheritedData && entity.resolvedInheritedData.tags && entity.resolvedInheritedData.tags.tag && entity.resolvedInheritedData.tags.tag.length) {
      item.tags = entity.resolvedInheritedData.tags.tag;
    }

    if (entity.previewBinarySet && entity.previewBinarySet[0].author) {
      item.author = entity.previewBinarySet[0].author;
    }

    var width = isDetail ? 875 : 350;
    var previewBinaryPurpose = item.type == "collection" ? 1200 : item.binaryType == "document" ? 19002 : 19000;

    if (isDetail) {
      previewBinaryPurpose = item.type == "collection" ? 1200 : 19001;

      if (item.binaryType) {
        switch (item.binaryType) {
          case "image":
            previewBinaryPurpose = 19001;
            break;
          case "audio":
            previewBinaryPurpose = 19006;
            item.audioSrc = this.getBinarySrc(entity, 19005, -1);
            break;
          case "video":
            previewBinaryPurpose = 19004;
            item.videoSrc = this.getBinarySrc(entity, 19005, width);
            break;
          case "document":
            previewBinaryPurpose = 19002;
            item.pdfSrc = this.getBinarySrc(entity, 10001, -2);
            width = 700;
            break;

        }
      }

    }

    item.previewImage = this.getBinarySrc(entity, previewBinaryPurpose, width);

    return item;
  };

  this.defineType = function (type) {

    /* TODO: switch to constants */

    switch (type) {
      case 1:
        return "collection";
      case 2:
        return "asset";
      default:
        return "undefined";
    }

  };

  this.defineBinaryType = function (binaryType) {

    /* TODO: switch to constants */

    switch (binaryType) {
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

  this.getBinarySrc = function (entity, binaryPurpose, width) {
    var indexToUse = -1;

    var bP = binaryPurpose ? binaryPurpose : 19000;
    var w = width ? width : 560;

    for (var i = 0; i < entity.previewBinarySet[0].calculatedBinary.length; i++) {
      if (entity.previewBinarySet[0].calculatedBinary[i].binaryPurpose === bP &&
        entity.previewBinarySet[0].calculatedBinary[i].outputId >= w
      ) {
        indexToUse = i;
      }
    }

    if (indexToUse > -1) {
      return entity.previewBinarySet[0].calculatedBinary[indexToUse].downloadLink;
    } else {
      return false;
    }

  };

  this.addEvent = function (object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
      object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
      object.attachEvent("on" + type, callback);
    } else {
      object["on" + type] = callback;
    }
  };

}

var cw = new ContidioWidget();
cw.init();



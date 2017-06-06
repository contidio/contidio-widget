function ContidioWidget() {

  this.defaultOptions = {
    container: ".contidio-widget",
    itemClass: "contidio-item",
    translations: {
      detailLink: "more"
    },
    onListClick: null,
    beforeRender: null,
    afterRender: null
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

      that.extractItems(json);

      if(typeof options.beforeRender === "function"){
        options.beforeRender(that.items);
      }

      if (json.entity) {


        var $itemList = $("<div class='contidio-item-list contidio-container'></div>");

        for (var i = 0; i < that.items.length; i++) {
          $itemList.append(renderer.renderListView(that.items[i]));
        }

        $(options.container).append($itemList);

      } else {

        $(options.container).append(renderer.renderDetailView(that.items[0]));

      }

      if(typeof options.afterRender === "function"){
        options.afterRender(that.items);
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
      type: this.getType(entity.type),
      url: "https://www.contidio.com/" + this.getType(entity.type) + "/" + entity.uuid
    };

    if (entity.workingSetBinaryType) {
      item.binaryType = this.getBinaryType(entity.workingSetBinaryType);
    }

    if (entity.resolvedInheritedData && entity.resolvedInheritedData.tags && entity.resolvedInheritedData.tags.tag && entity.resolvedInheritedData.tags.tag.length) {
      item.tags = entity.resolvedInheritedData.tags.tag;
    }

    if (entity.previewBinarySet && entity.previewBinarySet[0].author) {
      item.author = entity.previewBinarySet[0].author;
    }

    var timeStampForDate = entity.lastUpdatedTimestamp || entity.createdTimestamp;

    var date = new Date(timeStampForDate);

    item.date = (date.getDate() < 10 ? "0" : 0) + date.getDate()+"."+(date.getMonth() < 9 ? "0" : 0)+(date.getMonth()+1)+"."+date.getFullYear();

    var width = isDetail ? 875 : 350;
    var previewBinaryPurpose = 19000;

    if (isDetail) {
      previewBinaryPurpose = item.type == "folder" ? 1200 : 19001;

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
            //check if document is richtext story
            if(entity.asset && entity.asset.type && entity.asset.type === 2) {
              item.isStory = true;
              item.coverImage = this.getBinarySrc(entity, 19008, 1920);
              var htmlSrc = this.getBinarySrc(entity, 10001, -2);
              previewBinaryPurpose = 19010;
              width = 875;

              item.html = fetch(htmlSrc, {
                headers: {
                  'x-contidio-sdk': '1.0-JS'
                }
              }).then(function (response) {
                 return response.text();
              }).then(function (text){
                return text;
              });

            }else{
              item.isStory = false;
              previewBinaryPurpose = 19002;
              item.pdfSrc = this.getBinarySrc(entity, 10001, -2);
              width = 700;

            }
            break;
        }
      }
    } else {
      previewBinaryPurpose = item.type == "folder" ? 1200 : 19000;

      switch (item.type) {
        case "brand":
          previewBinaryPurpose = 100;
          break;
        case "folder":
          previewBinaryPurpose = 1200;
          break;
      }

      if (item.binaryType) {
        switch (item.binaryType) {
          case "video":
            previewBinaryPurpose = 19002;
            break;
          case "document":
            previewBinaryPurpose = (entity.asset && entity.asset.type === 2) ? 19000 : 19002;
            break;
        }
      }
    }

    item.previewImage = this.getBinarySrc(entity, previewBinaryPurpose, width);

    console.log(item);

    return item;
  };

  this.getType = function (type) {

    /* TODO: switch to constants */

    switch (type) {
      case 0:
        return "brand";
      case 1:
        return "folder";
      case 2:
        return "asset";
      default:
        return "undefined";
    }

  };

  this.getBinaryType = function (binaryType) {

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

    if (!entity.previewBinarySet || entity.previewBinarySet.length === 0) {
      return this.getPlaceholderSrc(entity);
    }

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
      return this.getPlaceholderSrc(entity);
    }

  };

  this.getPlaceholderSrc = function (entity) {
    var type = this.getType(entity.type);
    var binaryType = this.getBinaryType(entity.workingSetBinaryType);

    if (type === "folder") {
      return "https://www.contidio.com/assets/placeholders/folder_gray.png";
    }

    if (binaryType === "document") {
      return "https://www.contidio.com/assets/placeholders/document_landscape.png";
    }

    return "https://www.contidio.com/assets/placeholders/" + binaryType + "_gray.png";
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



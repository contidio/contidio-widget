function ContidioWidget() {

  this.defaultOptions = {
    container: ".contidio-widget",
    itemClass: "contidio-item",
    translations: {
      detailLink: "more"
    },
    onListClick: null,
    onListClickTarget: "_blank",
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

    require('whatwg-fetch');

    if (!window.Promise) {
      window.Promise = Promise;
    }

    var url = this.options.url ? this.options.url : '';

    this.fetchUrl(url);

  };

  this.fetchUrl = function (url) {

    var $;
    this.items = [];

    if (typeof jQuery === 'undefined') {
      $ = require('domtastic');
    } else {
      $ = jQuery;
    }

    var options = this.options;
    var renderer = new Renderer(this, $);
    var that = this;

    fetch(url, {
      headers: {
        'x-contidio-sdk': '1.0-JS'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (json) {

      that.extractItems(json);

      if (typeof options.beforeRender === "function") {
        options.beforeRender(that.items);
      }

      if (json.entity) {

        var $itemList = $("<div class='contidio-item-list contidio-container'></div>");

        for (var i = 0; i < that.items.length; i++) {
          $itemList.append(renderer.renderListView(that.items[i]));
        }

        $(options.container)[0].innerHTML = "";
        $(options.container).html("").append($itemList);

      } else {

        $(options.container).html("").append(renderer.renderDetailView(that.items[0]));

      }

      if (typeof options.afterRender === "function") {
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

    item.date = (date.getDate() < 10 ? "0" : 0) + date.getDate() + "." + (date.getMonth() < 9 ? "0" : 0) + (date.getMonth() + 1) + "." + date.getFullYear();

    var width = isDetail ? 875 : 350;
    var previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_LIST_PREVIEW;

    if (isDetail) {
      previewBinaryPurpose = item.type == "folder" ? this.CONSTANTS.BinaryPurpose.FOLDER_LIST_PREVIEW : this.CONSTANTS.BinaryPurpose.ASSET_PREVIEW;

      if (item.binaryType) {
        switch (item.binaryType) {
          case "image":
            previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_PREVIEW;
            break;
          case "audio":
            previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_COVER;
            item.audioSrc = this.getBinarySrc(entity, this.CONSTANTS.BinaryPurpose.ASSET_ADVANCED_PREVIEW, -1);
            break;
          case "video":
            previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_ADVANCED_PREVIEW_IMAGE;
            item.videoSrc = this.getBinarySrc(entity, this.CONSTANTS.BinaryPurpose.ASSET_ADVANCED_PREVIEW, width);
            break;
          case "document":
            //check if document is richtext story
            if (entity.asset && entity.asset.type && entity.asset.type === 2) {
              item.isStory = true;
              item.coverImage = this.getBinarySrc(entity, this.CONSTANTS.BinaryPurpose.ASSET_BACKGROUND, 1920);

              if (item.coverImage.indexOf("placeholder") > -1) {
                item.coverImage = false;
              }

              var htmlSrc = this.getBinarySrc(entity, this.CONSTANTS.BinaryPurpose.ASSET_BASE, -2);
              previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_HEADER;
              width = 875;

              item.html = fetch(htmlSrc, {
                headers: {
                  'x-contidio-sdk': '1.0-JS'
                }
              }).then(function (response) {
                return response.text();
              }).then(function (text) {
                return text;
              });

            } else {
              item.isStory = false;
              previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_ADVANCED_LIST_PREVIEW_IMAGE;
              item.pdfSrc = this.getBinarySrc(entity, this.CONSTANTS.BinaryPurpose.ASSET_BASE, -2);
              width = 700;

            }
            break;
        }
      }
    } else {
      previewBinaryPurpose = item.type == "folder" ? this.CONSTANTS.BinaryPurpose.FOLDER_LIST_PREVIEW : this.CONSTANTS.BinaryPurpose.ASSET_LIST_PREVIEW;

      switch (item.type) {
        case "brand":
          previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.BRAND_LOGO;
          break;
        case "folder":
          previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.FOLDER_LIST_PREVIEW;
          break;
      }

      if (item.binaryType) {
        switch (item.binaryType) {
          case "video":
            previewBinaryPurpose = this.CONSTANTS.BinaryPurpose.ASSET_ADVANCED_LIST_PREVIEW_IMAGE;
            break;
          case "document":
            previewBinaryPurpose = (entity.asset && entity.asset.type === 2) ? this.CONSTANTS.BinaryPurpose.ASSET_LIST_PREVIEW : this.CONSTANTS.BinaryPurpose.ASSET_ADVANCED_LIST_PREVIEW_IMAGE;
            break;
        }
      }
    }

    item.previewImage = this.getBinarySrc(entity, previewBinaryPurpose, width);

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

    var bP = binaryPurpose ? binaryPurpose : this.CONSTANTS.BinaryPurpose.ASSET_LIST_PREVIEW;
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

  this.CONSTANTS = {
    EXCERPT_END_IDENTIFIER : "--SNIP--",
    BinaryPurpose : {
      BRAND_LOGO : 100,
      BRAND_ASSET : 150,
      BRAND_BACKGROUND : 200,
      BRAND_BACKGROUND_TALL : 250,
      BRAND_WATERMARK : 300,
      FOLDER_ASSET : 1000,
      FOLDER_BACKGROUND : 1100,
      FOLDER_BACKGROUND_TALL : 1150,
      FOLDER_LIST_PREVIEW : 1200,
      JOBS_ASSET : 1500,
      JOBS_BACKGROUND : 1600,
      JOBS_BACKGROUND_TALL : 1650,
      JOBS_LIST_PREVIEW : 1700,
      JOB_ASSET : 2000,
      JOB_BACKGROUND : 2100,
      JOB_BACKGROUND_TALL : 2150,
      JOB_LIST_PREVIEW : 2200,
      PROJECT_ASSET : 3000,
      PROJECT_BACKGROUND : 3100,
      PROJECT_BACKGROUND_TALL : 3150,
      PROJECT_LIST_PREVIEW : 3200,
      ASSET_ASSET : 10000,
      ASSET_BASE : 10001,
      ASSET_LIST_PREVIEW : 19000,
      ASSET_PREVIEW : 19001,
      ASSET_ADVANCED_LIST_PREVIEW_IMAGE : 19002,
      ASSET_ADVANCED_LIST_PREVIEW : 19003,
      ASSET_ADVANCED_PREVIEW_IMAGE : 19004,
      ASSET_ADVANCED_PREVIEW : 19005,
      ASSET_COVER : 19006,
      ASSET_BACKGROUND_ASSET : 19007,
      ASSET_BACKGROUND : 19008,
      ASSET_BACKGROUND_TALL : 19009,
      ASSET_HEADER : 19010,
      ASSET_SPLITVIEW_LIST_PREVIEW : 19011
    }
  };

}


var cw = new ContidioWidget();

cw.init();



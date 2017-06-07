/** Contidio Widget: default renderer
 @param {Object} options
 @param $ DOMtastic, see https://domtastic.js.org/
 */
function Renderer(widget, $) {

  this.widget = widget;
  this.options = (widget && widget.options) ? widget.options : {};

  /**
   * used to render an item list view
   * @param item
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderListView = function (item) {

    var options = this.options;
    var that = this;

    $item = $("<a target='"+options.onListClickTarget+"' "+"href='" + item.url + "' class='" + options.itemClass + " " + item.type + "'></a>");

    if(typeof options.onListClick === "function"){
      $item.on("click",options.onListClick.bind(this, item, widget));
    }

    $item.data("uuid", item.uuid);

    $itemInner = $("<div class='contidio-item-inner'></div>");

    $imageContainer = $("<div class='contidio-image-container'></div>");

    $imagePositioner = $("<div class='contidio-image-positioner'></div>");

    if (item.binaryType) {
      if (item.binaryType == "audio") {
        $imagePositioner.append("<i class='contidio-icon contidio-icon-audio'>&#9836;</i>");
      } else if (item.binaryType == "video") {
        $imagePositioner.append("<i class='contidio-icon contidio-icon-video'>&#9655;</i>");
      }
    }

    if (item.previewImage) {
      var img = new Image();
      img.onload = function () {
        that.positionImage(img);
      };
      img.src = item.previewImage;
      img.alt = item.name;
      img.className = 'contidio-item-image';
      $imagePositioner.append(img);
    }

    $imageContainer.append($imagePositioner);
    $itemInner.append($imageContainer);

    $itemText = $("<div class='contidio-text-container'></div>");

    if(item.category) {
      $itemText.append("<div class='contidio-item-category'>" + item.category + "</div>");
    }

    $itemText.append("<div class='contidio-item-name'>" + item.name + "</div>");

    $itemMeta = $("<div class='contidio-item-meta'></div>");

    if(item.authorImage) {
      $itemMeta.append("<span class='contidio-item-author-image'><img src='"+item.authorImage+"'/></span>");
    }
    if(item.author) {
      $itemMeta.append("<span class='contidio-item-author-name'>"+item.author+"</span>");
    }
    if(item.date) {
      $itemMeta.append("<span class='contidio-item-date'>"+item.date+"</span>");
    }

    $itemText.append($itemMeta);

    $itemText.append("<div class='contidio-detail-link'>" + options.translations.detailLink + "</div>");

    $itemInner.append($itemText);

    $item.append($itemInner);

    return ($item);

  };

  /**
   * Used to render an item detail view
   * @param item
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderDetailView = function (item) {

    var $detailView = $("<div class='contidio-detail-view'></div>");

    var $assetPreview = $("<div class='contidio-asset-preview'></div>");

    if (item.binaryType) {

      if (item.binaryType == "image") {
        $assetPreview.append("<div class='contidio-preview-wrapper contidio-image-wrapper'><img src='" + item.previewImage + "' /></div>");
      } else if (item.binaryType == "audio") {
        $assetPreview.append("<div class='contidio-preview-wrapper contidio-audio-wrapper'><img src='" + item.previewImage + "' /><audio controls><source src='" + item.audioSrc + "' type='audio/mp4'/></audio></div>");
      } else if (item.binaryType == "video") {
        $assetPreview.append("<div class='contidio-preview-wrapper contidio-video-wrapper'><video controls poster='" + item.previewImage + "'><source src='" + item.videoSrc + "' type='video/mp4'/></video></div>");
      } else if (item.binaryType == "document") {
        $assetPreview.append("<div class='contidio-preview-wrapper contidio-document-wrapper'><img src='" + (item.coverImage ? item.coverImage : item.previewImage) + "' /></div>");
        if(item.isStory){
          $assetPreview.append("<div class='contidio-story-title'><div class='contidio-center-wrapper'><div class='contidio-center-content'>"+item.name+"</div></div></div>");
        }
      }

    }

    /* Asset Meta Data */
    var $assetMeta = $("<div class='contidio-asset-meta'></div>");

    if(item.isStory){
      var $assetMetaContainer = $("<div class='contidio-container'></div>");

      if(item.authorImage) {
        $assetMetaContainer.append("<span class='contidio-item-author-image'><img src='"+item.authorImage+"'/></span>");
      }
      if(item.author) {
        $assetMetaContainer.append("<span class='contidio-item-author-name'>"+item.author+"</span>");
      }
      if(item.date) {
        $assetMetaContainer.append("<span class='contidio-item-date'>"+item.date+"</span>");
      }
      if(item.category) {
        $assetMetaContainer.append("<div class='contidio-item-category'>"+item.category+"</div>");
      }

      $assetMeta.append($assetMetaContainer);
    }


    /* Asset Data */
    var $assetData = $("<div class='contidio-asset-data contidio-container'></div>");

    if(!item.isStory){
      $assetData.append("<div class='contidio-asset-name'>" + item.name + "</div>");
    }

    if (item.description) {
      $assetData.append("<div class='contidio-asset-description'>" + item.description + "</div>");
    }

    if (item.editorial) {
      $assetData.append("<div class='contidio-asset-editorial'>" + item.editorial + "</div>");
    }

    /* Tags */
    if (item.tags) {
      $tags = $("<ul class='contidio-asset-tags'></ul>");

      for (t = 0; t < item.tags.length; t++) {
        $tags.append("<li class='contidio-asset-tag'>" + item.tags[t].text + "</li>");
      }

      $assetData.append($tags);
    }

    /* Richtext */
    if(item.html){

      var that = this;

      item.html.then(function(text){

        if (text.indexOf(that.widget.CONSTANTS.EXCERPT_END_IDENTIFIER) == text.length - that.widget.CONSTANTS.EXCERPT_END_IDENTIFIER.length) {
          text = text.replace(that.widget.CONSTANTS.EXCERPT_END_IDENTIFIER, "");
        }

        $assetData.append("<div class='contidio-asset-story'>" + text + "</div>");
      });
    }

    /* License Button */
    var $detailButtonContainer = $("<div class='contidio-container contidio-button-container'></div>");
    $detailButtonContainer.append("<a class='contidio-button' href='https://www.contidio.com/asset/"+item.uuid+"'><svg class='contidio-button-icon' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='33px' height='33px' viewBox='0 0 33 33' enable-background='new 0 0 33 33' xml:space='preserve'><g><g><path fill='#FFFFFF' d='M16.501,29.751c-7.306,0-13.25-5.945-13.25-13.251c0-7.305,5.944-13.25,13.25-13.25 c3.154,0,6.053,1.11,8.331,2.958l2.307-2.306C24.263,1.471,20.551,0,16.501,0C7.403,0,0,7.402,0,16.5C0,25.6,7.403,33,16.501,33 c4.05,0,7.762-1.469,10.638-3.899l-2.307-2.307C22.554,28.641,19.655,29.751,16.501,29.751z'></path></g><g><path fill='#FFFFFF' d='M8.61,16.5c0,4.353,3.539,7.894,7.891,7.894c1.676,0,3.228-0.527,4.511-1.421l-2.364-2.361 c-0.642,0.337-1.372,0.53-2.147,0.53c-2.559,0-4.642-2.081-4.642-4.642c0-2.558,2.083-4.641,4.642-4.641 c0.775,0,1.505,0.194,2.147,0.532l2.364-2.362c-1.283-0.894-2.834-1.421-4.511-1.421C12.148,8.608,8.61,12.149,8.61,16.5z'></path></g><g><path fill='#FFFFFF' d='M30.068,7.127l-2.342,2.344c1.28,2.038,2.024,4.449,2.024,7.029c0,2.581-0.744,4.993-2.024,7.031 l2.342,2.344C31.917,23.212,33,19.981,33,16.5C33,13.02,31.917,9.789,30.068,7.127z'></path></g></g></svg>"+this.options.translations.licenseButton+"</a>");

    /* Putting it all together */
    $detailView.append($assetPreview);
    $detailView.append($assetMeta);
    $detailView.append($assetData);
    $detailView.append($detailButtonContainer);

    return $detailView;
  };

  /**
   * Will be called on window resize (optional)
   */
  this.resize = function () {

    var $entries = $(this.options.container + " ." + this.options.itemClass);

    var itemsPerRow = this.getItemsPerRow();
    var titleHeight = 0;

    for (var j = 0; j < $entries.length; j++) {

      var title = $($entries[j]).find(".contidio-item-name")[0];

      title.style.height = "auto";

      titleHeight = Math.max(titleHeight, title.offsetHeight);

      if ((j + 1) % itemsPerRow == 0) {

        for (var i = 0; i < itemsPerRow; i++) {

          if (i + j < $entries.length) {
            $($entries[j - i]).find(".contidio-item-name")[0].style.height = titleHeight + "px";
          }
        }

        titleHeight = 0;
      }

      var image = $($entries[j]).find(".contidio-item-image")[0];

      this.positionImage(image);

    }
  };

  /**
   * Renderer specific helper function
   * @returns {number}
   */
  this.getItemsPerRow = function () {
    return window.outerWidth > 897 ? 3 : window.outerWidth > 729 ? 2 : 1;
  };

  this.positionImage = function(image) {



    if(image.naturalWidth < image.naturalHeight) {
      image.style.height = "auto";
      image.style.width = "100%";
    } else if(image.naturalWidth > image.naturalHeight) {

      var calcHeight = 100;
      var arDelta = 360 / 224 - image.naturalWidth / image.naturalHeight;

      if(arDelta > 0){
        calcHeight = 100 + 100 * arDelta;
      }

      image.style.width = "auto";
      image.style.height = calcHeight+"%";
    }

    var width = image.clientWidth;
    var height = image.clientHeight;

    image.style.marginTop = "-"+(height/2)+"px";
    image.style.marginLeft = "-"+(width/2)+"px";

  }

}

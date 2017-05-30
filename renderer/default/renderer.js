/** Contidio Widget: default renderer
 @param {Object} options
 @param $ DOMtastic, see https://domtastic.js.org/
 */
function Renderer(options, $) {

  this.options = options ? options : {};

  /**
   * used to render an item list view
   * @param item
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderListView = function (item) {

    var options = this.options;

    $item = $("<a target='_blank' "+"href='" + item.url + "' class='" + options.itemClass + " " + item.type + "'></a>");

    if(typeof options.onClick === "function"){
      $item.on("click",options.onClick.bind(this, item));
    }

    $item.data("uuid", item.uuid);

    $itemInner = $("<div class='contidio-item-inner'></div>");

    $imageContainer = $("<div class='contidio-image-container'></div>");

    if (item.binaryType) {
      if (item.binaryType == "audio") {
        $imageContainer.append("<i class='contidio-icon contidio-icon-audio'>&#9836;</i>");
      } else if (item.binaryType == "video") {
        $imageContainer.append("<i class='contidio-icon contidio-icon-video'>&#9655;</i>");
      }
    }

    if (item.previewImage) {
      $imageContainer.append("<img class='contidio-item-image' alt='" + item.name + "' src='" + item.previewImage + "'/>");
    }

    $itemInner.append($imageContainer);

    $itemText = $("<div class='contidio-text-container'></div>");

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

    $detailView = $("<div class='contidio-detail-view'></div>");

    $assetPreview = $("<div class='contidio-asset-preview'></div>");

    if (item.binaryType) {

      if (item.binaryType == "image") {
        $assetPreview.append("<div class='contidio-image-wrapper'><img src='" + item.previewImage + "' /></div>");
      } else if (item.binaryType == "audio") {
        $assetPreview.append("<div class='contidio-audio-wrapper'><img src='" + item.previewImage + "' /><audio controls><source src='" + item.audioSrc + "' type='audio/mp4'/></audio></div>");
      } else if (item.binaryType == "video") {
        $assetPreview.append("<div class='contidio-video-wrapper'><video controls poster='" + item.previewImage + "'><source src='" + item.videoSrc + "' type='video/mp4'/></video></div>");
      } else if (item.binaryType == "document") {
        $assetPreview.append("<div class='contidio-document-wrapper'><img src='" + item.previewImage + "' /></div>");
      }

    }

    $assetData = $("<div class='contidio-asset-data'></div>");

    $assetData.append("<div class='contidio-asset-name'>" + item.name + "</div>");

    if (item.description) {
      $assetData.append("<div class='contidio-asset-description'>" + item.description + "</div>");
    }
    if (item.editorial) {
      $assetData.append("<div class='contidio-asset-editorial'>" + item.editorial + "</div>");
    }

    if (item.tags) {
      $tags = $("<ul class='contidio-asset-tags'></ul>");

      for (t = 0; t < item.tags.length; t++) {
        $tags.append("<li class='contidio-asset-tag'>" + item.tags[t].text + "</li>");
      }

      $assetData.append($tags);
    }

    if (item.author) {
      $assetData.append("<div class='contidio-asset-author'>" + item.author + "</div>");
    }

    $detailView.append($assetPreview);
    $detailView.append($assetData);

    return $detailView;
  };

  /**
   * Will be called on window resize (optional)
   */
  this.resize = function () {

    var $entries = $(this.options.container + " ." + this.options.itemClass);

    var itemsPerRow = this.getItemsPerRow();
    var height = 0;

    for (var j = 0; j < $entries.length; j++) {

      var $title = $($entries[j]).find(".contidio-item-name")[0];

      $title.style.height = "auto";

      height = Math.max(height, $title.offsetHeight);

      if ((j + 1) % itemsPerRow == 0) {

        for (var i = 0; i < itemsPerRow; i++) {

          if (i + j < $entries.length) {
            $($entries[j - i]).find(".contidio-item-name")[0].style.height = height + "px";
          }
        }

        height = 0;
      }
    }
  };

  /**
   * Renderer specific helper function
   * @returns {number}
   */
  this.getItemsPerRow = function () {
    return window.outerWidth > 897 ? 3 : window.outerWidth > 729 ? 2 : 1;
  };

}

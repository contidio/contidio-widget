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

    $item = $("<div class='" + options.itemClass + " " + item.type + "'></div>");
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
      $imageContainer.append("<img class='contidio-item-image' src='" + item.previewImage + "'/>");
    }

    $itemInner.append($imageContainer);

    $itemText = $("<div class='contidio-text-container'></div>");

    $itemText.append("<div class='contidio-item-name'>" + item.name + "</div>");

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

    

    return $("<div class='contidio-detail-view'></div>");
  };

  /**
   * Will be called on window resize (optional)
   */
  this.resize = function () {

    var $entries = $(this.options.container + " ." + this.options.itemClass);

    var itemsPerRow = this.getItemsPerRow();
    var height = 0;

    for(var j = 0; j < $entries.length; j++) {

      $entries[j].style.height= "auto";

      height = Math.max(height, $entries[j].offsetHeight);

      if ((j + 1) % itemsPerRow == 0) {

        for (var i = 0; i < itemsPerRow; i++) {

          if (i + j < $entries.length) {
            $entries[j - i].style.height = height + "px";
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

/** Contidio Widget: default renderer
 @param {Object} widget
 @param $ DOMtastic || jQuery, see https://domtastic.js.org/
 */
function ContidioRenderer(widget, $) {

  this.widget = widget;
  this.options = (widget && widget.options) ? widget.options : {};

  this.pdfConfig = {
    pdfDoc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
    scale: 2,
    canvas: null,
    ctx: null
  };

  /**
   * Used to render an item list view
   * @param items
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderListView = function (items) {

    var options = this.options;
    var that = this;

    var $itemList = $("<div class='contidio-item-list contidio-container'></div>");

    for(var i = 0; i < items.length; i++){
      var item = items[i];

      if(!item.type){
        continue;
      }

      if(item.restricted) {
        item.url = "https://www.contidio.com/"+item.type+"/"+item.uuid;
      }

      var $item = $("<a target='" + options.onListClickTarget + "' " + "href='" + item.url + "' class='" + options.itemClass + " " + item.type + "'></a>");

      if (typeof options.onListClick === "function" && !item.restricted) {
        $item.on("click", options.onListClick.bind(this, item, widget));
      }

      $item.data("uuid", item.uuid);

      var $itemInner = $("<div class='contidio-item-inner'></div>");

      var $imageContainer = $("<div class='contidio-image-container'></div>");

      var $imagePositioner = $("<div class='contidio-image-positioner'></div>");

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
          that.positionImage(this);
        };
        img.src = item.previewImage;
        img.alt = item.name;
        img.className = 'contidio-item-image';
        $imagePositioner.append(img);
      }

      $imageContainer.append($imagePositioner);
      $itemInner.append($imageContainer);

      var $itemText = $("<div class='contidio-text-container'></div>");

      $itemText.append("<div class='contidio-item-category'>" + (item.category ? item.category : "") + "</div>");

      $itemText.append("<div class='contidio-item-name'>" + item.name + "</div>");

      var $itemMeta = $("<div class='contidio-item-meta'></div>");

      if (item.authorImage && item.isStory) {
        $itemMeta.append("<span class='contidio-item-author-image'><img src='" + item.authorImage + "'/></span>");
      }
      if (item.author && item.isStory) {
        $itemMeta.append("<span class='contidio-item-author-name'>" + item.author + "</span>");
      }
      if (item.publicationDate) {
        $itemMeta.append("<span class='contidio-item-date'>" + item.publicationDate + "</span>");
      }

      $itemText.append($itemMeta);

      $itemText.append("<div class='contidio-detail-link'>" + options.translations.detailLink + "</div>");

      $itemInner.append($itemText);

      $item.append($itemInner);

      $itemList.append($item);


    }

    return ($itemList);

  };

  /**
   * Used to render an item detail view
   * @param item
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderDetailView = function (item) {

    var that = this;

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

        var documentImage = "<img src='" + (item.coverImage ? item.coverImage : item.previewImage) + "' />";

        if ((!item.story && item.pdfSrc) || (item.isStory && !item.coverImage && (item.previewImage.indexOf("placeholder")) > -1)) {
          documentImage = "";
        }

        $assetPreview.append("<div class='contidio-preview-wrapper contidio-document-wrapper'>" + documentImage + "</div>");

        if (item.isStory) {
          $assetPreview.append("<div class='contidio-story-title'><div class='contidio-center-wrapper'><div class='contidio-center-content'>" + item.name + "</div></div></div>");
        } else {

          var $pdfControls = $("<div class='contidio-pdf-controls'></div>");
          var $pdfPrev = $("<button class='contidio-pdf-prev'>&lt;</button>");
          var $pdfPages = $("<span class='contidio-pdf-pages'></span>");
          var $pdfNext = $("<button class='contidio-pdf-next'>&gt;</button>");


          $pdfPrev.on("click", that.onPrevPage.bind(that));
          $pdfNext.on("click", that.onNextPage.bind(that));

          $pdfControls.append($pdfPrev);
          $pdfControls.append($pdfPages);
          $pdfControls.append($pdfNext);
          $assetPreview.append($pdfControls);


          var $canvas = $("<canvas></canvas>");
          this.pdfConfig.canvas = $canvas[0];
          this.pdfConfig.ctx = $canvas[0].getContext('2d');

          this.require("//cdnjs.cloudflare.com/ajax/libs/pdf.js/1.6.471/pdf.combined.min.js", function () {
            // The workerSrc property shall be specified.
            PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

            // Asynchronous download of PDF
            var loadingTask = PDFJS.getDocument(item.pdfSrc);
            loadingTask.promise.then(function (pdfDoc_) {

              that.pdfConfig.pdfDoc = pdfDoc_;
              document.getElementsByClassName('contidio-pdf-pages')[0].textContent = that.pdfConfig.pageNum + "/" + that.pdfConfig.pdfDoc.numPages;
              document.getElementsByClassName("contidio-document-wrapper")[0].appendChild(that.pdfConfig.canvas);

              that.renderPage(that.pdfConfig.pageNum);

            });
          });
        }
      }

    }

    /* Asset Meta Data */
    var $assetMeta = $("<div class='contidio-asset-meta'></div>");

    if (item.isStory) {
      var $assetMetaContainer = $("<div class='contidio-container'></div>");

      if (item.authorImage) {
        $assetMetaContainer.append("<span class='contidio-item-author-image'><img src='" + item.authorImage + "'/></span>");
      }
      if (item.author) {
        $assetMetaContainer.append("<span class='contidio-item-author-name'>" + item.author + "</span>");
      }
      if (item.publicationDate) {
        $assetMetaContainer.append("<span class='contidio-item-date'>" + item.publicationDate + "</span>");
      }
      if (item.category) {
        $assetMetaContainer.append("<div class='contidio-item-category'>" + item.category + "</div>");
      }

      $assetMeta.append($assetMetaContainer);
    }


    /* Asset Data */
    var $assetData = $("<div class='contidio-asset-data contidio-container'></div>");

    if (!item.isStory) {
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
    if (item.html) {

      item.html.then(function (text) {
        var isCut = false;
        if (text.indexOf(that.widget.CONSTANTS.EXCERPT_END_IDENTIFIER) == text.length - that.widget.CONSTANTS.EXCERPT_END_IDENTIFIER.length) {
          text = text.replace(that.widget.CONSTANTS.EXCERPT_END_IDENTIFIER, "");
          isCut = true;
        }

        $assetData.append("<div class='contidio-asset-story'>" + text + "</div>");

        if(isCut){
          $assetData.append("<div class='contidio-hint-message'>" + that.options.translations.endOfExcerpt + "</div>");
        }

      });
    }

    /* License Button */
    var $detailButtonContainer = $("<div class='contidio-container contidio-button-container'></div>");
    $detailButtonContainer.append("<a class='contidio-button' target='_blank' href='https://www.contidio.com/asset/" + item.uuid + "'><svg class='contidio-button-icon' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='33px' height='33px' viewBox='0 0 33 33' enable-background='new 0 0 33 33' xml:space='preserve'><g><g><path fill='#FFFFFF' d='M16.501,29.751c-7.306,0-13.25-5.945-13.25-13.251c0-7.305,5.944-13.25,13.25-13.25 c3.154,0,6.053,1.11,8.331,2.958l2.307-2.306C24.263,1.471,20.551,0,16.501,0C7.403,0,0,7.402,0,16.5C0,25.6,7.403,33,16.501,33 c4.05,0,7.762-1.469,10.638-3.899l-2.307-2.307C22.554,28.641,19.655,29.751,16.501,29.751z'></path></g><g><path fill='#FFFFFF' d='M8.61,16.5c0,4.353,3.539,7.894,7.891,7.894c1.676,0,3.228-0.527,4.511-1.421l-2.364-2.361 c-0.642,0.337-1.372,0.53-2.147,0.53c-2.559,0-4.642-2.081-4.642-4.642c0-2.558,2.083-4.641,4.642-4.641 c0.775,0,1.505,0.194,2.147,0.532l2.364-2.362c-1.283-0.894-2.834-1.421-4.511-1.421C12.148,8.608,8.61,12.149,8.61,16.5z'></path></g><g><path fill='#FFFFFF' d='M30.068,7.127l-2.342,2.344c1.28,2.038,2.024,4.449,2.024,7.029c0,2.581-0.744,4.993-2.024,7.031 l2.342,2.344C31.917,23.212,33,19.981,33,16.5C33,13.02,31.917,9.789,30.068,7.127z'></path></g></g></svg>" + this.options.translations.licenseButton + "</a>");

    /* Putting it all together */
    $detailView.append($assetPreview);
    $detailView.append($assetMeta);
    $detailView.append($assetData);
    $detailView.append($detailButtonContainer);

    return $detailView;
  };

  /**
   * Used for displaying errors
   * @param error
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderError = function (error) {
    return $("<div class='contidio-hint-message contidio-container'>"+this.options.translations.fetchError+"</div>");
  };

  /**
   * Used for displaying the loading animation (optional)
   * @returns {*|jQuery|HTMLElement|string}
   */
  this.renderLoader = function() {
    return $("<div class='contidio-loader'><div class='contidio-loader-bounce'></div><div class='contidio-loader-bounce'></div></div>");
  };

  /**
   * Will be called on window resize (optional)
   */
  this.resize = function () {

    var $entries = $(this.options.container + " ." + this.options.itemClass);

    var itemsPerRow = this.getItemsPerRow();

    var rowItems = [];

    if($entries.length < itemsPerRow) {
      this.adjustRow($entries);
    }

    for (var j = 0; j < $entries.length; j++) {

      rowItems.push($entries[j]);

      if(rowItems.length === itemsPerRow && $entries.length >= itemsPerRow) {
        this.adjustRow(rowItems);
        rowItems = [];
      }

      var image = $($entries[j]).find(".contidio-item-image")[0];

      this.positionImage(image);

    }
  };

  /**
   * Provided with a set of items to adjust varying heights
   */
  this.adjustRow = function(items) {

    var attributesToAdjust = [".contidio-item-name",".contidio-item-category"];
    var maxPerAttribute = new Array(attributesToAdjust.length);

    for (var i = 0; i < items.length; i++) {
      for (var j = 0; j < attributesToAdjust.length; j++) {
        var element = $(items[i]).find(attributesToAdjust[j])[0];

        //reset height to be measured correctly
        element.style.height = "auto";

        var currentAttributeMax = maxPerAttribute[j] || 0;

        maxPerAttribute[j] = Math.max(currentAttributeMax, element.clientHeight);
      }
    }

    for (var k = 0; k < items.length; k++) {
      for (var l = 0; l < attributesToAdjust.length; l++) {
        $(items[k]).find(attributesToAdjust[l])[0].style.height = maxPerAttribute[l] + "px";
      }
    }

  };

  /**
   * Renderer specific helper function to determine how many items should be displayed per row (responsive breakpoints)
   * @returns {number}
   */
  this.getItemsPerRow = function () {
    return window.outerWidth > 897 ? 3 : window.outerWidth > 729 ? 2 : 1;
  };

  /**
   * Renderer specific helper function to position the image in the list view the best way possible.
   * @param image
   */
  this.positionImage = function (image) {

    if (image.naturalWidth < image.naturalHeight) {
      image.style.height = "auto";
      image.style.width = "100%";
    } else {

      var calcHeight = 100;
      var arDelta = 360 / 224 - image.naturalWidth / image.naturalHeight;

      if (arDelta > 0) {
        calcHeight = 100 + 100 * arDelta;
      }

      image.style.width = "auto";
      image.style.height = calcHeight + "%";
    }

    var width = image.clientWidth;
    var height = image.clientHeight;

    image.style.marginTop = "-" + (height / 2) + "px";
    image.style.marginLeft = "-" + (width / 2) + "px";

  };

  this.require = function (file, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    //real browsers
    script.onload = callback;
    //Internet explorer
    script.onreadystatechange = function () {
      if (this.readyState == 'complete') {
        callback();
      }
    };
    head.appendChild(script);
  };

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  this.renderPage = function (num) {
    var that = this;
    that.pdfConfig.pageRendering = true;
    // Using promise to fetch the page
    that.pdfConfig.pdfDoc.getPage(num).then(function (page) {
      var viewport = page.getViewport(that.pdfConfig.scale);
      that.pdfConfig.canvas.height = viewport.height;
      that.pdfConfig.canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: that.pdfConfig.ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        that.pdfConfig.pageRendering = false;
        if (that.pdfConfig.pageNumPending !== null) {
          // New page rendering is pending
          that.renderPage(that.pdfConfig.pageNumPending);
          that.pdfConfig.pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementsByClassName('contidio-pdf-pages')[0].textContent = that.pdfConfig.pageNum + "/" + that.pdfConfig.pdfDoc.numPages;
  };

  /**
   * Displays previous page.
   */
  this.onPrevPage = function () {
    if (this.pdfConfig.pageNum <= 1) {
      return;
    }
    this.pdfConfig.pageNum--;
    this.queueRenderPage(this.pdfConfig.pageNum);
  };

  /**
   * Displays next page.
   */
  this.onNextPage = function () {
    if (this.pdfConfig.pageNum >= this.pdfConfig.pdfDoc.numPages) {
      return;
    }
    this.pdfConfig.pageNum++;
    this.queueRenderPage(this.pdfConfig.pageNum);
  };

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  this.queueRenderPage = function (num) {
    if (this.pdfConfig.pageRendering) {
      this.pdfConfig.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }


}

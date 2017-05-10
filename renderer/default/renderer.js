function Renderer($, options){

    this.options = options ? options : {};

    this.init = function(){
        this.draw();
    };

    this.renderListItem = function(item) {

        var options = this.options;

        $item = $("<div class='"+options.itemClass+" "+item.type+"'></div>");
        $item.data("uuid",item.uuid);

        $itemInner = $("<div class='contidio-item-inner'></div>");

        $imageContainer = $("<div class='contidio-image-container'></div>");

        if(item.binaryType == "audio"){
            $imageContainer.append("<i class='contidio-icon contidio-icon-audio'>&#9836;</i>");
        }else if(item.workingSetBinaryType == "video"){
            $imageContainer.append("<i class='contidio-icon contidio-icon-video'>&#9655;</i>");
        }

        if(item.previewImage){
            $imageContainer.append("<img class='contidio-item-image' src='"+item.previewImage+"'/>");
        }

        $itemInner.append($imageContainer);

        $itemText = $("<div class='contidio-text-container'></div>");

        $itemText.append("<div class='contidio-item-name'>"+item.name+"</div>");

        $itemInner.append($itemText);

        $item.append($itemInner);

        return($item);

    };

    this.renderDetail = function(item) {

    };

    this.resize = function(){

        var $entries = $(this.options.container+" ."+this.options.itemClass);

        var itemsPerRow = this.getItemsPerRow();
        var height = 0;

        $entries.each(function(value, key){

            $entries[key].style.height = "auto";

            height = Math.max(height, value.offsetHeight);

            if((key+1) % itemsPerRow  == 0){

                for(var i = 0; i < itemsPerRow; i++) {

                    if(i + key < $entries.length){
                        $entries[key-i].style.height = height+"px";
                    }
                }

                height = 0;
            }
        });
    };

    this.getItemsPerRow = function(){
        return window.outerWidth > 897 ? 3 : window.outerWidth > 729 ? 2 : 1;
    };

}
function Renderer($, json, options){

    this.defaultOptions = {
      container: ".contidio-widget"
    };

    this.options = options ? options : {};

    this.enitities = json.entity ? json.entity : json;

    this.draw = function(){

        var options = this.mergeOptions(this.defaultOptions, this.options);

        $(options.container).innerHTML = "";

        var $results = $("<div class='contidio-entities'></div>");

        this.enitities.forEach(function (entity) {

            $entity = $("<div class='contidio-entity type-"+entity.type+"'></div>");
            $entity.data("uuid",entity.uuid);

            $entityInner = $("<div class='contidio-entity-inner'></div>");

            $entityInner.append("<div class='contidio-image-container'><img class='contidio-entity-image' src='"+entity.previewBinarySet[0].calculatedBinary[0].downloadLink+"'/></div>");


            $entityText = $("<div class='contidio-text-container'></div>");

            $entityText.append("<div class='contidio-entity-name'>"+(entity.name ? entity.name : entity.uuid)+"</div>");



            $entityInner.append($entityText);


            $entity.append($entityInner);
            $results.append($entity);
        });

        $(options.container).append($results);

        this.resize();

        this.addEvent(window, "resize", this.resize.bind(this));

    };

    this.resize = function(){
        var $entries = $(".contidio-entity");

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

    this.getItemsPerRow = function(){
        return window.outerWidth > 897 ? 3 : window.outerWidth > 729 ? 2 : 1;
    };

    this.mergeOptions = function(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    };

}
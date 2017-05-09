function Renderer($, entities, options){

    this.defaultOptions = {
      container: ".contidio-widget"
    };

    this.options = options ? options : {};

    this.enitities = entities ? entities : [];

    this.draw = function(){

        var options = mergeOptions(this.defaultOptions, this.options);

        var $results = $("<div class='contidio-entities'></div>");

        this.enitities.forEach(function (entity) {
            console.log(entity);

            $entity = $("<div class='contidio-entity'></div>");
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

    };

    function mergeOptions(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

}
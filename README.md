# contidio-widget
Include a single or multiple Contidio Assets or Overviews into your existing website

## Usage

To use the widget in your website, download the package, host the necessary files and insert this code within your website:

```
<!-- BEGIN: Contidio widget container -->
<div class="contidio-widget"></div>
<!-- END: Contidio widget container -->

<!-- BEGIN: Contidio renderer (customize if needed) -->
<link href="../renderer/default/styles.css" rel="stylesheet"/>
<script src="../renderer/default/renderer.js"></script>
<!-- END: Contidio renderer -->

<!-- BEGIN: Conditio widget snippet -->
<script>
    var contidioOptions = {
        url: <PLACE_CONTIDIO_EMBED_URL_HERE>
    }
</script>
<script src="../dist/contidio-widget.js" async defer></script>
<!-- END: Contidio widget snippet -->
```

**NOTE**: The widget is still in early development. Soon there will be a hosted version for the widget and its default renderer.

## Development

Prerequisites:
```
npm install
```

To build the widget:
```
npm run build
```

To watch for changes:
```
npm run watch
```

#### Example

Start up the webserver:
```
npm run example
```

And go to http://127.0.0.1:8080/example to see a list of all examples

## Widget Options

to set Options for the Contidio Widget, create a _contidioOptions_ object:

```
<script>
    var contidioOptions = {...}
</script>
```

The following options are currently available:

| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| `url` | string | "" | The Contidio API URL used to retrieve the data json |
| `container` | string | ".contidio-widget" | CSS Selector used to append the widget |
| `itemClass` | string | "contidio-item" | CSS Class used to wrap each retrieved item  |
| `translations` | Object | _see translations_ | Used to store localized text information |
| `hideDetailButton` | bool | false | If set, will hide the contidio license button on the detail view
| `onListClick` | Function | null | OnClick Callback function for list view |
| `onListClickTarget` | string | "\_blank" | used to control the target of an list-item click
| `beforeRender` | Function | null | Callback function called before Markup is generated and appended  |
| `afterRender` | Function | null | Callback function called after Markup is generated and appended |


#### Localization / Translations

Every text that originates from the widget itself can be translated (or changed, if you prefer different wording) using the _translations_ object withing the _contidioOptions_ object.

| Key | Default | Description |
|:---|:---|:---|
| `detailLink` | "more" | Used in the list view as a call-to-action link |
| `licenseButton` | "License on Contidio" | The button text for the detail view, which takes the user to Contidio |
| `endOfExcerpt` | "(The preview of the story ends here. Please license this asset to download the full story)" | Stories can be limited to an excerpt. If that's the case, this text will be shown to inform the user that there is more available if licensed |

## Renderer

The Contidio Widget let's you use custom renderer to fully adapt the data display to your existing design.
You can either build it from scratch or adapt the default renderer for your needs.

```
<!-- BEGIN: Contidio renderer (customize if needed) -->
<link href="../renderer/default/styles.css" rel="stylesheet"/>
<script src="../renderer/default/renderer.js"></script>
<!-- END: Contidio renderer -->
```

A Contidio Widget Renderer consists of two files, one .js and one .css file. The JavaScript part is a function that must be named _ContidioRenderer_, with two child-functions called _renderListView_ and _renderDetailView_.

```
function ContidioRenderer(widget, $) {...}
```

The param _widget_ is the entire widget instance, including options and constants.
The param _$_ is either jQuery (if already available in your site), or the much tinier DOMtastic (with similar API, see https://domtastic.js.org/)


```
this.renderListView(item) {...}
```

```
this.renderDetailView(item) {...}
```

the param _item_ is an Object containing all available data.


## FAQ

**Q: Where to i get the `url` for the widget?**
    
**A:** We are working on a simple solution. In the meanwhile, look at the network panel of your browser console while on Contidio.
 
 The schema for asset urls is:
 ```
 https://mdidx.contidio.com/api/v1/assets/<ASSET_UUID>/anonymous/?flags=145340470544642
 ```
 
 for folders:
 ```
 https://mdidx.contidio.com/api/v1/folders/<FOLDER_UUID>/childs/anonymous/?flags=145340470544642
 ```
 
 for (asset) search-results:
 ``` 
 https://mdidx.contidio.com/api/v1/searchEntities/anonymous/?flags=145340470544642&startIndex=0&count=20&orderBy=2&orderDirection=2&recursive=1&locale=en&types=1&source=1
 ```

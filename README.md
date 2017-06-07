# contidio-widget
Include a single or multiple Contidio Assets or Overviews into your existing website

### Development

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

### Example

Start up the webserver:
```
npm run example
```

And go to http://127.0.0.1:8080/example to see a list of all examples


### Widget Options

| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| url | string | "" | The Contidio API URL used to retrieve the data json |
| container | string | ".contidio-widget" | CSS Selector used to append the widget |
| itemClass | string | "contidio-item" | CSS Class used to wrap each retrieved item  |
| translations | Object | {detailLink: "more",licenseButton: "License on Contidio"} | Used to store localized text information |
| hideDetailButton | bool | false | If set, will hide the contidio license button on the detail view
| onListClick | Function | null | OnClick Callback function for list view |
| onListClickTarget | string | "\_blank" | used to control the target of an list-item click
| beforeRender | Function | null | Callback function called before Markup is generated and appended  |
| afterRender | Function | null | Callback function called after Markup is generated and appended |


### Renderer

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



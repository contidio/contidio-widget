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
| container | string | ".contidio-widget" | CSS Selector used to append the widget |
| itemClass | string | "contidio-item" | CSS Class used to wrap each retrieved item  |
| translations | Object | {detailLink: "more"} | Used to store localized text information |
| onListClick | Function | null | OnClick Callback function for list view |
| beforeRender | Function | null | Callback function called before Markup is generated and appended  |
| afterRender | Function | null | Callback function called after Markup is generated and appended |

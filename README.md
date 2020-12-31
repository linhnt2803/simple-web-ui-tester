# simple-web-ui-tester
The respository for npm [simple-web-ui-tester](https://www.npmjs.com/package/simple-web-ui-tester)

Helper for tester and developer to reducing manual jobs in dev team. Make easy to write test case on web page.

## Installing

Using npm

```console
npm i simple-web-ui-tester
```

## Basic usage

With node
```js
const tester = require('simple-web-ui-tester')
```
Mock a google searching
```js

// A script mock user go to google page then research
const script = [
  "go_to <<https://www.google.com>>",
  "input_to <<input[name='q']>> value <<simple-web-ui-tester npm>>",
  "click_on <<input[name='btnK']>>",
  "wait <<3000>> note <<the result page should show up on screen>>"
]

tester.formatThenRunActions(script)
  .then(console.log)

```
Output
```console
{
  startTime: 20dd-dd-ddTdd:dd:dd.dddZ,
  endTime: 20dd-dd-ddTdd:dd:dd.dddZ,
  actions: [
    {
      summary: 'go_to <<https://www.google.com>>',
      duration: 4106,
      pageTitle: 'Google'
    },
    {
      summary: "input_to <<input[name='q']>> value <<simple-web-ui-tester npm>>",
      duration: 1
    },
    {
      summary: "click_on <<input[name='btnK']>>",
      duration: 3
    },
    { summary: 'wait <<3000>>', duration: 3002 }
  ],
  duration: 7112
}
```

## Summary
The tester need a script to run. Script including many actions that will be executed on browser proivded by puppeteer. We can write action as object or some as string that defining the user actions on web page.

Script can be run by:

```js
tester.runActions([ /*... accept wellform actions only (formatted actions) ... */ ])
```
or
```js
tester.formatThenRunActions([ /* ... accept actions defined by both object form or string form ... */ ])
```
or execute action on page (puppeteer web page) has the custom setup
```js
tester.formatThenRunActionsOnPage([ /* ... */ ], page)
```

The tester already including the settings of some basic actions and can accept new by using

```js
tester.addActionSetting("action_name", { /* ... new action settings ... */ })
```

For some case we dont need to view the browser working so we can work in the headless mode by using

```js
tester.setBrowserHeadless(true)
```

## Basic actions settings
An action work almost like a function with input is the meta data, handler is the body and output as error or result.
Optional meta data can be skipped when defining an action.

###### ```go_to``` go to an url
Object form
```js
{
    url: String,
    waitUntil: "load" | "domcontentloaded" | "networkidle0" | "networkidle2",
    timeout: Number,
    note: String
}
```
String form
```js
    "go_to <<url>>"
    "go_to <<url>> waitUntil <<waitUntil>> timeout <<timeout>> note <<note>>"
```

Optinal meta keys: ```["waitUntil", "timeout", "note"]```

###### ```click_on``` click on the target selected by selector
Object form
```js
{
    selector: String,
    note: String
}
```
String form
```js
    "click_on <<selector>>",
    "click_on <<selector>> note <<note>>"
```

Optinal meta keys: ```["note"]```

###### ```input_to``` input some value to the target selected by selector
Object form
```js
{
    selector: String,
    value: String,
    note: String
}
```
String form
```js
    "input_to <<selector>> value <<value>>",
    "input_to <<selector>> value <<value>> note <<note>>"
```

Optinal meta keys: ```["note"]```

###### ```select_on``` input some value to the target (select tag) selected by selector
Object form
```js
{
    selector: String,
    value: String,
    note: String
}
```
String form
```js
    "select_on <<selector>> value <<value>>",
    "select_on <<selector>> value <<value>> note <<note>>"
```

Optinal meta keys: ```["note"]```

###### ```wait``` just wait in a time by milisec
Object form
```js
{
    milisec: Number,
    note: String
}
```
String form
```js
    "wait <<milisec>>",
    "wait <<milisec>> note <<note>>"
```

Optinal meta keys: ```["note"]```

###### ```capture_screen``` capture the screen image then save to file path
Object form
```js
{
    path: String,
    note: String
}
```
String form
```js
    "capture_screen <<path>>",
    "capture_screen <<path>> note <<note>>"
```

Optinal meta keys: ```["note"]```

###### ```group``` define a group of many actions
Object form
```js
{
    groupName: String,
    actions: [Action],
    note: String
}
```
String form not support

Optinal meta keys: ```["groupName", "note"]```
## License

MIT

const {
  stringNotEmpty,
  stringLengthMinMax,
  validateAll,
  numberMinMax,
} = require("../utils/validator");
const { wait } = require("../utils");
const { formatActions } = require('./action-formatter')

// logical: ['condition', 'actionTrue', 'actionFalse']
// for: ['count', 'action']
// while: ['condition', 'action']
// throw: ['message']
// condition *
// expect *
// wait_for_url: ['url', 'timeout']
const ACTION_SETTINGS = {
  /**
   * @summary first action should call in test scripts. Same as user enter url then press
   *  enter to page
   */
  go_to: {
    metaKeys: ["url"],
    templateCommand: "go_to <<url>>",
    regexCommand: /^go_to <<(?<url>.*)>>(?<note>.*)$/,
    metaValidator: function (meta) {
      let { url } = meta;
      return validateAll([
        stringNotEmpty("url")(url),
        stringLengthMinMax("url", 2, 512)(url),
      ]);
    },
    handler: async function (meta, page) {
      let { url } = meta;
      let startTime = Date.now();
      await page.goto(url, { waitUntil: "networkidle0" });
      return {
        summary: `go_to <<${url}>>`,
        duration: Date.now() - startTime,
      };
    },
  },
  /**
   * @summary Same as user click on element match selector
   */
  click_on: {
    metaKeys: ["selector"],
    templateCommand: "click_on <<selector>>",
    regexCommand: /^click_on <<(?<selector>.*)>>(?<note>.*)$/,
    metaValidator: function (meta) {
      let { selector } = meta;
      return validateAll([
        stringNotEmpty("selector")(selector),
        stringLengthMinMax("selector", 1, 512)(selector),
      ]);
    },
    handler: async function (meta, page) {
      let { selector } = meta;
      let startTime = Date.now();
      let clicked = await page.evaluate((_selector) => {
        let item = document.querySelector(_selector);
        if (item && item.click instanceof Function) {
          item.click();
          return true;
        }
        return false;
      }, selector);

      if (!clicked) {
        throw new Error(`Click on failed! Item '${selector}' not found!`);
      }

      return {
        summary: `click_on <<${selector}>>`,
        duration: Date.now() - startTime,
      };
    },
  },
  /**
   * @summary Same as user enter a value to input element match selector
   */
  input_to: {
    metaKeys: ["selector", "value"],
    templateCommand: "input_to <<selector>> value <<value>>",
    regexCommand: /^input_to <<(?<selector>.*)>> value <<(?<value>.*)>>(?<note>.*)$/,
    metaValidator: function (meta) {
      let { selector, value } = meta;
      return validateAll([
        stringNotEmpty("selector")(selector),
        stringLengthMinMax("selector", 1, 512)(selector),
        stringLengthMinMax("value", null, 2048)(value),
      ]);
    },
    handler: async function (meta, page) {
      let { selector, value } = meta;
      let startTime = Date.now();
      let inputted = await page.evaluate(
        (_selector, _value) => {
          let item = document.querySelector(_selector);
          if (item) {
            item.value = _value;
            return true;
          }
          return false;
        },
        selector,
        value
      );

      if (!inputted) {
        throw new Error(`Input to failed! Item '${selector}' not found!`);
      }

      return {
        summary: `input_to <<${selector}>> value <<${value}>>`,
        duration: Date.now() - startTime,
      };
    },
  },
  /**
   * @summary Same as user select a value on select element match selector
   */
  select_on: {
    metaKeys: ["selector", "value"],
    templateCommand: "select_on <<selector>> value <<value>>",
    regexCommand: /^select_on <<(?<selector>.*)>> value <<(?<value>.*)>>(?<note>.*)$/,
    metaValidator: function (meta) {
      let { selector, value } = meta;
      return validateAll([
        stringNotEmpty("selector")(selector),
        stringLengthMinMax("selector", 1, 512)(selector),
        stringLengthMinMax("value", null, 2048)(value),
      ]);
    },
    handler: async function (meta, page) {
      let { selector, value } = meta;
      let startTime = Date.now();
      let selectted = await page.evaluate(
        (_selector, _value) => {
          let item = document.querySelector(_selector);
          if (item) {
            item.value = _value;
            return true;
          }
          return false;
        },
        selector,
        value
      );

      if (!selectted) {
        throw new Error(`Select on failed! Item '${selector}' not found!`);
      }

      return {
        summary: `select_on <<${selector}>> value <<${value}>>`,
        duration: Date.now() - startTime,
      };
    },
  },
  /**
   * @summary Same as user wait in a time (count by milisec)
   */
  wait: {
    metaKeys: ["milisec"],
    templateCommand: "wait <<milisec>>",
    regexCommand: /^wait <<(?<milisec>.*)>>(?<note>.*)$/,
    metaValidator: function (meta) {
      meta.milisec = parseInt(meta.milisec) || 0;
      let anHour = 1000 * 60 * 60;

      return numberMinMax("milisec", 0, anHour);
    },
    handler: async function (meta, page) {
      let { milisec } = meta;
      let startTime = Date.now();

      await wait(milisec);

      return {
        summary: `wait <<${milisec}>>`,
        duration: Date.now() - startTime,
      };
    },
  },
  /**
   * @summary Same as user wait in a time (count by milisec)
   */
  group: {
    metaKeys: ["actions", "groupName"],
    templateCommand: null,
    regexCommand: null,
    metaValidator: function (meta) {
      let { actions, groupName } = meta

      meta.actions = formatActions(actions)

      return validateAll([
        stringNotEmpty("selector")(groupName),
        stringLengthMinMax("selector", 1, 512)(groupName)
      ]);
    },
    handler: async function (meta, page) {
      // place import here prevent circle dependencies
      const { runActionsOnPage } = require("./action-runner");
      let { groupName, actions } = meta;
      let actionCount = actions.length;
      let startTime = Date.now();

      let result = await runActionsOnPage(actions, page);

      return {
        summary: `group '${groupName}' with ${actionCount} actions`,
        duration: Date.now() - startTime,
        result,
      };
    },
  },
};

const VALID_ACTION_NAMES = Object.keys(ACTION_SETTINGS)

module.exports = {
  ACTION_SETTINGS,
  VALID_ACTION_NAMES
}
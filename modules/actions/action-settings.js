const {
  stringNotEmpty,
  stringLengthMinMax,
  validateAll,
  numberMinMax,
  enum: checkEnum,
} = require("../utils/validator");
const { wait } = require("../utils");

const {
  DEFAULT_PUPPETEER_TIMEOUT,
  AN_HOUR,
  WAIT_UNTIL_ENUMS,
} = require("../config");

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
    metaKeys: ["url", "waitUntil", "timeout", "note"],
    templateCommand: [
      "go_to <<url>>",
      "go_to <<url>> waitUntil <<waitUntil>> timeout <<timeout>> note <<note>>",
    ],
    regexCommand: /(?<=(go_to[\s]+<<))(?<url>([^>>]*))(?=>>)(>>)(?<optional>.*)$/,
    optionalMetasRegex: {
      waitUntil: _genOptionalMetaRegex("waitUntil"),
      timeout: _genOptionalMetaRegex("timeout"),
      note: _genOptionalMetaRegex("note"),
    },
    metaValidator: function (meta) {
      meta.timeout = meta.timeout ? parseInt(meta.timeout) || 0 : undefined;
      let { url, waitUntil, timeout, note } = meta;

      return validateAll([
        stringNotEmpty("url")(url),
        stringLengthMinMax("url", 2, 512)(url),
        checkEnum("waitUntil", WAIT_UNTIL_ENUMS)(waitUntil),
        numberMinMax("timeout", 0, AN_HOUR)(timeout),
        stringLengthMinMax("note", 0, 1024)(note),
      ]);
    },
    handler: async function (meta, page) {
      let { url, waitUntil, timeout, note } = meta;
      let startTime = Date.now();

      await page.goto(url, {
        waitUntil: waitUntil || "networkidle0",
        timeout: timeout || DEFAULT_PUPPETEER_TIMEOUT,
      });

      let _waitUntilSum = _genOptionalMetaSummary("waitUntil", waitUntil);
      let _timeoutSum = _genOptionalMetaSummary("timeout", timeout);
      let _pageTitle = await page.title().catch(() => "")

      return {
        summary: `go_to <<${url}>>${_waitUntilSum}${_timeoutSum}`,
        duration: Date.now() - startTime,
        note,
        pageTitle: _pageTitle
      };
    },
  },
  /**
   * @summary Same as user click on element match selector
   */
  click_on: {
    metaKeys: ["selector", "note"],
    templateCommand: [
      "click_on <<selector>>",
      "click_on <<selector>> note <<note>>"
    ],
    // /^click_on <<(?<selector>.*)>>(?<note>.*)$/,
    regexCommand: /(?<=(click_on[\s]+<<))(?<selector>([^>>]*))(?=>>)(>>)(?<optional>.*)$/,
    optionalMetasRegex: {
      note: _genOptionalMetaRegex("note"),
    },
    metaValidator: function (meta) {
      let { selector, note } = meta;

      return validateAll([
        stringNotEmpty("selector")(selector),
        stringLengthMinMax("selector", 1, 512)(selector),
        stringLengthMinMax("note", 0, 1024)(note),
      ]);
    },
    handler: async function (meta, page) {
      let { selector, note } = meta;

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
        note
      };
    },
  },
  /**
   * @summary Same as user enter a value to input element match selector
   */
  input_to: {
    metaKeys: ["selector", "value", "note"],
    templateCommand: [
      "input_to <<selector>> value <<value>>",
      "input_to <<selector>> value <<value>> note <<note>>"
    ],
    // /^input_to <<(?<selector>.*)>> value <<(?<value>.*)>>(?<note>.*)$/
    regexCommand: /(?<=(input_to[\s]+<<))(?<selector>([^>>]*))(?=>>)(>>)([\s]+value[\s]+<<)(?<value>([^>>]*))(?=>>)(>>)(?<optional>.*)$/,
    optionalMetasRegex: {
      note: _genOptionalMetaRegex("note"),
    },
    metaValidator: function (meta) {
      let { selector, value, note } = meta;
      return validateAll([
        stringNotEmpty("selector")(selector),
        stringLengthMinMax("selector", 1, 512)(selector),
        stringLengthMinMax("value", null, 2048)(value),
        stringLengthMinMax("note", 0, 1024)(note),
      ]);
    },
    handler: async function (meta, page) {
      let { selector, value, note } = meta;
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
        note
      };
    },
  },
  /**
   * @summary Same as user select a value on select element match selector
   */
  select_on: {
    metaKeys: ["selector", "value", "note"],
    templateCommand: [
      "select_on <<selector>> value <<value>>",
      "select_on <<selector>> value <<value>> note <<note>>"
    ],
    // regexCommand: /^select_on <<(?<selector>.*)>> value <<(?<value>.*)>>(?<note>.*)$/,
    regexCommand: /(?<=(select_on[\s]+<<))(?<selector>([^>>]*))(?=>>)(>>)([\s]+value[\s]+<<)(?<value>([^>>]*))(?=>>)(>>)(?<optional>.*)$/,
    optionalMetasRegex: {
      note: _genOptionalMetaRegex("note"),
    },
    metaValidator: function (meta) {
      let { selector, value, note } = meta;

      return validateAll([
        stringNotEmpty("selector")(selector),
        stringLengthMinMax("selector", 1, 512)(selector),
        stringLengthMinMax("value", null, 2048)(value),
        stringLengthMinMax("note", 0, 1024)(note),
      ]);
    },
    handler: async function (meta, page) {
      let { selector, value, note } = meta;
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
        note
      };
    },
  },
  /**
   * @summary Same as user wait in a time (count by milisec)
   */
  wait: {
    metaKeys: ["milisec", "note"],
    templateCommand: [
      "wait <<milisec>>",
      "wait <<milisec>> note <<note>>"
    ],
    // regexCommand: /^wait <<(?<milisec>.*)>>(?<note>.*)$/,
    regexCommand: /(?<=(wait[\s]+<<))(?<milisec>([^>>]*))(?=>>)(>>)(?<optional>.*)$/,
    optionalMetasRegex: {
      note: _genOptionalMetaRegex("note"),
    },
    metaValidator: function (meta) {
      meta.milisec = parseInt(meta.milisec) || 0;

      let { milisec, note } = meta

      return validateAll([
        numberMinMax("milisec", 0, AN_HOUR)(milisec),
        stringLengthMinMax("note", 0, 1024)(note)
      ]);
    },
    handler: async function (meta, page) {
      let { milisec, note } = meta;
      let startTime = Date.now();

      await wait(milisec);

      return {
        summary: `wait <<${milisec}>>`,
        duration: Date.now() - startTime,
        note
      };
    },
  },
  /**
   * @summary Same as user wait in a time (count by milisec)
   */
  group: {
    metaKeys: ["actions", "groupName", "note"],
    templateCommand: null,
    regexCommand: null,
    metaValidator: function (meta) {
      // place import here prevent circle dependencies
      const { formatActions } = require("./action-formatter");
      let { actions, groupName, note } = meta;

      meta.actions = formatActions(actions);

      return validateAll([
        stringNotEmpty("selector")(groupName),
        stringLengthMinMax("selector", 1, 512)(groupName),
        stringLengthMinMax("note", 0, 1024)(note)
      ]);
    },
    handler: async function (meta, page) {
      // place import here prevent circle dependencies
      const { runActionsOnPage } = require("./action-runner");
      let { groupName, actions, note } = meta;
      let actionCount = actions.length;
      let startTime = Date.now();

      let result = await runActionsOnPage(actions, page);

      return {
        summary: `group '${groupName}' with ${actionCount} actions`,
        duration: Date.now() - startTime,
        result,
        note
      };
    },
  },
  /**
   * @summary Take a page screen shot then save to file (path = file path)
   */
  capture_screen: {
    metaKeys: ["path", "note"],
    templateCommand: [
      "capture_screen <<path>>",
      "capture_screen <<path>> note <<note>>"
    ],
    // regexCommand: /^capture_screen <<(?<path>.*)>>(?<note>.*)$/,
    regexCommand: /(?<=(capture_screen[\s]+<<))(?<path>([^>>]*))(?=>>)(>>)(?<optional>.*)$/,
    optionalMetasRegex: {
      note: _genOptionalMetaRegex("note"),
    },
    metaValidator: function (meta) {
      let { path, note } = meta;
      return validateAll([
        stringNotEmpty("path")(path),
        stringLengthMinMax("path", 1, 512)(path),
        stringLengthMinMax("note", 0, 1024)(note)
      ]);
    },
    handler: async function (meta, page) {
      let { path, note } = meta;
      let startTime = Date.now();
      await page.screenshot({ path: path }).catch((err) => {
        if (err.message) {
          err.message = `capture_screen Error: ${err.message}`;
        }
        throw err;
      });

      return {
        summary: `capture_screen to <<${path}>>`,
        duration: Date.now() - startTime,
        note
      };
    },
  },
};

const VALID_ACTION_NAMES = Object.keys(ACTION_SETTINGS);

/**
 * @summary make sure you well understand how to define an action
 *  - actionName: name of action, should be unique, if pass an defined action, so it will overwrite
 *  - actionSetting.metaKeys: list of all keys in meta object
 *  - templateCommand: a String notice how to define action as template string (set null if action
 *    do not support)
 *  - regexCommand: regex to get meta values from template string (set null if action do not support)
 *  - handler: function handle the action
 *
 * @param {String} actionName
 * @param {{
 *  metaKeys: String[],
 *  templateCommand: (String | null),
 *  regexCommand: (RegExp | null),
 *  metaValidator: (meta) => (String | null),
 *  handler: (meta, page) => any
 * }} actionSetting
 */
function addActionSetting(actionName, actionSetting) {
  ACTION_SETTINGS[actionName] = actionSetting;
  if (!VALID_ACTION_NAMES.includes(actionName)) {
    VALID_ACTION_NAMES.push(actionName);
  }
}

function _genOptionalMetaRegex(metaKey) {
  return new RegExp(
    `(?<=(${metaKey}[\\s]+<<))(?<${metaKey}>([^>>]*))(?=>>)(>>)`
  );
}

function _genOptionalMetaSummary(varName, value) {
  return value === undefined ? "" : ` ${varName} <<${value}>>`;
}

module.exports = {
  ACTION_SETTINGS,
  VALID_ACTION_NAMES,
  addActionSetting,
};

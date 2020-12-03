/**
 *
 */
const browsers = require("./BrowserProvider");
const settings = require("./action-settings");
const formatter = require("./action-formatter");
const runner = require("./action-runner");

const _module = {
  ACTION_SETTINGS: settings.ACTION_SETTINGS,
  VALID_ACTION_NAMES: settings.VALID_ACTION_NAMES,

  BrowserProvider: browsers.BrowserProvider,
  browserProvider: browsers.browserProvider,
  setBrowserHeadless: browsers.setBrowserHeadless,

  formatAction: formatter.formatAction,
  formatActions: formatter.formatActions,

  runActions: runner.runActions,
  runActionsOnPage: runner.runActionsOnPage
};

module.exports = _module;

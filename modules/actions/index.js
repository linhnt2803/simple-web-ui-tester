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
  addActionSetting: settings.addActionSetting,

  BrowserProvider: browsers.BrowserProvider,
  browserProvider: browsers.browserProvider,
  setBrowserHeadless: browsers.setBrowserHeadless,

  formatAction: formatter.formatAction,
  formatActions: formatter.formatActions,

  formatThenRunActions: runner.formatThenRunActions,
  formatThenRunActionsOnPage: runner.formatThenRunActionsOnPage,
  runActions: runner.runActions,
  runActionsOnPage: runner.runActionsOnPage,
  setCloseBrowserAfterRunActions: runner.setCloseBrowserAfterRunActions
};

module.exports = _module;

/**
 *
 */
const BrowserProvider = require("./BrowserProvider");
const settings = require("./action-settings");
const formatter = require("./action-formatter");
const runner = require("./action-runner");

module.exports = {
  BrowserProvider,
  ...settings,
  ...formatter,
  ...runner,
};

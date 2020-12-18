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

function test() {
  // "go_to <<url>>",
  // "go_to <<url>> waitUntil <<waitUntil>> timeout <<timeout>> note <<note>>",
  // "click_on <<selector>>",
  // "click_on <<selector>> note <<note>>"
  // "input_to <<selector>> value <<value>>",
  // "input_to <<selector>> value <<value>> note <<note>>"
  // "select_on <<selector>> value <<value>>",
  // "select_on <<selector>> value <<value>> note <<note>>"
  // "wait <<milisec>>",
  // "wait <<milisec>> note <<note>>"
  // "capture_screen <<path>>",
  // "capture_screen <<path>> note <<note>>"

  const groupAction = {
    name: 'group',
    meta: {
      groupName: 'test',
      note: 'test group',
      actions: [
        "go_to <<http://dashboard.gamewithlocal.jp:8080/>> waitUntil <<domcontentloaded>> timeout <<60000>>",
        `input_to <<#form_username>> value <<haint2@vnext.com.vn>>`,
        `input_to <<#form_password>> value <<20200701>>`,
        `click_on <<button[name='login']>>`,
        `wait <<20000>>`
      ]
    }
  }

  runner.formatThenRunActions([groupAction])
    .then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(console.error)

  // let reg = /(?<=(input_to[\s]+<<))(?<selector>([^>>]*))(?=>>)(>>)[?<=([\s]+value[\s]+<<)].*$/
  // let reg = /(?<=(input_to[\s]+<<))(?<selector>([^>>]*))(?=>>)(>>)([\s]+value[\s]+<<)(?<value>([^>>]*))(?=>>)(>>)(?<optional>.*)$/
  // let text = `input_to <<#form_username>> value <<haint2@vnext.com.vn>>`

  // console.log(text.match(reg))
}

test()

module.exports = _module;

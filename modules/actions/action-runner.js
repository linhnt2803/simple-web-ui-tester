const { ACTION_SETTINGS } = require("./action-settings");
const { browserProvider } = require("./BrowserProvider");

async function runActions(actions) {
  let page = await browserProvider.getPage();

  try {
    let result = await runActionsOnPage(actions, page);
    await page.close().catch(() => {});
    return result;
  } catch (error) {
    await page.close().catch(() => {});
    throw error;
  }
}

async function runActionsOnPage(actions, page) {
  let startTime = new Date()
  let result = {
    startTime: new Date(),
    endTime: startTime,
    actions: [],
    duration: 0,
  };

  if (!(actions instanceof Array) || !actions.length) return result;

  let currentActionName = null;

  try {
    for (let action of actions) {
      let { name, meta } = action;
      currentActionName = name;
      let actionSetting = ACTION_SETTINGS[name];
      let { handler } = actionSetting;
      let actionResult = await handler(meta, page);
      result.actions.push(actionResult);
    }
    result.endTime = new Date();
    result.duration = result.startTime - result.endTime;
    return result;
  } catch (error) {
    let errorMessage = currentActionName
      ? `${currentActionName} - ${error.message}`
      : error.message;
    error.message = errorMessage;
    throw error;
  }
}

module.exports = {
  runActions,
  runActionsOnPage,
};

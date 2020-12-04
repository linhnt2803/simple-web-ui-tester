const { ACTION_SETTINGS } = require("./action-settings");
const { browserProvider } = require("./BrowserProvider");
const { formatActions } = require("./action-formatter");

const _OPTIONS = {
  closeBrowserAfterRunActions: true,
};

function setCloseBrowserAfterRunActions(shouldClose) {
  _OPTIONS.closeBrowserAfterRunActions = Boolean(shouldClose);
}

function formatThenRunActions(actionsData) {
  let actions = formatActions(actionsData);
  return runActions(actions);
}

function formatThenRunActionsOnPage(actionsData, page) {
  let actions = formatActions(actionsData);
  return runActionsOnPage(actions, page);
}

async function runActions(actions) {
  let page = await browserProvider.getPage();
  let closer = async () => {
    await page.close().catch(() => {});
    if (_OPTIONS.closeBrowserAfterRunActions) {
      await browserProvider.closeBrowser();
    }
  };
  try {
    let result = await runActionsOnPage(actions, page);
    await closer();
    return result;
  } catch (error) {
    await closer();
    throw error;
  }
}

async function runActionsOnPage(actions, page) {
  let startTime = new Date();
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
  formatThenRunActions,
  formatThenRunActionsOnPage,
  runActions,
  runActionsOnPage,
  setCloseBrowserAfterRunActions,
};

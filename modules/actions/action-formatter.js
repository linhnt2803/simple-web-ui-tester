const { ACTION_SETTINGS, VALID_ACTION_NAMES } = require("./action-settings");

function formatActions(actionsData) {
  if (!(actionsData instanceof Array))
    throw new Error("Actions must be array!");

  return actionsData.map(formatAction);
}

function formatAction(action) {
  if (typeof action === "string") {
    let actionName = action.split(" ")[0];

    if (!actionName) throw new Error(`Invalid action '${action}'`);

    action = {
      name: actionName,
      template: action,
    };
  }

  if (action instanceof Object) {
    let { name, template, meta } = action;

    if (!name || !VALID_ACTION_NAMES.includes(name))
      throw new Error(`Invalid action name '${name}'`);

    let actionSetting = ACTION_SETTINGS[name];
    if (typeof template === "string") {
      meta = _genActionMetaFromCommand(template, actionSetting);
    }

    if (actionSetting.metaValidator instanceof Function) {
      let metaValidation = actionSetting.metaValidator(meta);
      if (typeof metaValidation === "string") {
        throw new Error(`Action '${name}' meta invalid - ${metaValidation}`);
      }
    }

    return {
      name,
      meta,
    };
  }

  throw new Error(`Invalid action ${JSON.stringify(action)}`);
}

function _notSupportActionTempate(actionSetting) {
  return !actionSetting.regexCommand;
}

function _genActionMetaFromCommand(template, actionSetting) {
  /**
   * command = "go_to <<https://qwerty.net>> heyhey"
   * > return meta = { url: 'https://qwerty.net', note: 'heyhey' }
   */
  if (_notSupportActionTempate(actionSetting))
    throw new Error(
      `Action '${template}' do not support action template, this must define by object!`
    );

  let { metaKeys, regexCommand, optionalMetasRegex } = actionSetting;
  let matchedRegex = String(template).match(regexCommand);

  if (!matchedRegex)
    throw new Error(
      `Action template string seem not to be valid: '${template}'`
    );

  let dataFromCommand = matchedRegex.groups || {};
  let optionalTemplate = dataFromCommand["optional"] || "";
  let hasOptionalMeta = optionalMetasRegex && optionalTemplate
  
  let meta = {};

  for (let key of metaKeys) {
    if(hasOptionalMeta && key in optionalMetasRegex) { // optional key, can be exists or not
      let optionalReg = optionalMetasRegex[key]
      let optionalMatchedRegex = String(optionalTemplate).match(optionalReg)
      let optinalMetaValue = optionalMatchedRegex
        && optionalMatchedRegex.groups
        && optionalMatchedRegex.groups[key]
      meta[key] = optinalMetaValue || undefined
    } else { // require key
      meta[key] = dataFromCommand[key];
    }
  }

  return meta;
}

module.exports = {
  formatActions,
  formatAction,
};

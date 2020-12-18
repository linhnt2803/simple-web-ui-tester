function _shortcut(v, length) {
  v = typeof v === "string" ? v : String(v);
  return v.length <= length ? v : `${v.substring(0, length - 3)}...`;
}

function _genValueInfo(varName, v) {
  return `'${varName || "Value"}': '${_shortcut(v, 20)}'`;
}

module.exports = {
  stringNotEmpty: (varName) => (v) =>
    Boolean(typeof v === "string" && v) ||
    `${_genValueInfo(varName, v)} can not be empty!`,
  stringLengthMinMax: (varName, min, max) => (v) => {
    if (typeof v === "undefined") {
      return true; // by pass value undefined
    }
    if (typeof v === "string") {
      if (typeof min === "number") {
        if (v.length < min) {
          return `${_genValueInfo(
            varName,
            v
          )} must be longer or equal than ${min}!`;
        }
      }

      if (typeof max === "number") {
        if (v.length > max) {
          return `${_genValueInfo(
            varName,
            v
          )} must be shorter or equal than ${max}!`;
        }
      }

      return true;
    }
    return `${_genValueInfo(varName, v)} must be string!`;
  },
  stringMatchRegex: (varName, regex) => (v) => {
    if (typeof v === "undefined") {
      return true; // by pass value undefined
    }
    if (typeof v === "string") {
      return (
        regex.test(v) || `${_genValueInfo(varName, v)} not match regex ${regex}`
      );
    }
    return `${_genValueInfo(varName, v)} must be string!`;
  },
  numberMinMax: (varName, min, max) => (v) => {
    if (typeof v === "undefined") {
      return true; // by pass value undefined
    }
    if (typeof v === "number") {
      if (typeof min === "number") {
        if (v < min) {
          return `${_genValueInfo(
            varName,
            v
          )} must be greater or equal than ${min}!`;
        }
      }

      if (typeof max === "number") {
        if (v > max) {
          return `${_genValueInfo(
            varName,
            v
          )} must be less or equal than ${max}!`;
        }
      }

      return true;
    }
    return `${_genValueInfo(varName, v)} must be number!`;
  },
  enum: (varName, enums = []) => (v) => {
    if (typeof v === "undefined") {
      return true; // by pass value undefined
    }
    return ((enums || []).includes(v)) || `${_genValueInfo(varName, v)} must be one of ${JSON.stringify(enums)}!`
  },
  validateAll(validateResults) {
    for (let result of validateResults) {
      if (!result || typeof result === "string") {
        return result;
      }
    }
    return true;
  },
};

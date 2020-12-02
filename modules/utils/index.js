
function filterObjectByKeys(srcObj = {}, keys = []) {
  let des = {}
  for(let key of Object.keys(srcObj)) {
    if(keys.includes(key)) {
      des[key] = srcObj[key]
    }
  }
  return des
}

function wait(milisec) {
  return new Promise(resolve => setTimeout(resolve, milisec))
}

module.exports = {
  filterObjectByKeys,
  wait
}

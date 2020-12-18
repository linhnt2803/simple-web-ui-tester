const A_MILISEC = 1
const A_SEC = A_MILISEC * 1000
const A_MIN = A_SEC * 60
const AN_HOUR = A_MIN * 60
const A_DAY = AN_HOUR * 24

const DEFAULT_PUPPETEER_TIMEOUT = 30 * A_SEC
const WAIT_UNTIL_ENUMS = ["load", "domcontentloaded", "networkidle0", "networkidle2"]

module.exports = {
  A_MILISEC,
  A_SEC,
  A_MIN,
  AN_HOUR,
  A_DAY,

  DEFAULT_PUPPETEER_TIMEOUT,
  WAIT_UNTIL_ENUMS
}
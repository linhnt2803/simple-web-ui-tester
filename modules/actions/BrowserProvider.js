const pupp = require('puppeteer')
const uuid = require('uuid').v1
const { Browser } = require('puppeteer/lib/cjs/puppeteer/common/Browser')

const DEFAULT_OPTIONS = {
  headless: false
}

const SHOULD_CLOSE_BROWSER_AFTER = 1000 * 60 * 60 * 0.5 // close browser if can after 0.5 hour

class BrowserProvider {
  constructor(opts) {
    let options = opts instanceof Object ? opts : {}
    this._options = this._bindDefaultOptions(options)

    /**
     * @type {Browser}
     */
    this._browser = null
    this._browserTimestamps = 0
    /**
     * @summary save all page key created by method getPage()
     */
    this._pagesInUse = {}
  }

  async lauchBrowser() {
    if(!this._browser || this._shouldCloseCurrentBrowser()) {
      await this.closeBrowser()
      this._browser = await pupp.launch(this._options)
      this._browserTimestamps = Date.now()
      this._browser.on('disconnected', () => this._clearCurrentBrowser())
    }
    return this._browser
  }

  async getPage() {
    let browser = await this.lauchBrowser()
    let page = await browser.newPage()
    let pageId = uuid()
    page.pageId = pageId

    this._logPageInUse(pageId)
    page.on('close', () => this._clearLogPageInUse(pageId))

    return page
  }

  closeBrowser() {
    if(this._browser) {
      return this._browser.close().catch(() => {})
    }
  }

  _shouldCloseCurrentBrowser() {
    return this._isBrowserOpenedTooLong() && !this._isAnyPageInUse()
  }

  _clearCurrentBrowser() {
    this._browser = null
    for(let pageId in this._pagesInUse) {
      this._clearLogPageInUse(pageId)
    }
  }

  _bindDefaultOptions(opts) {
    for(let key in DEFAULT_OPTIONS) {
      if(opts[key] === undefined) {
        opts[key] = DEFAULT_OPTIONS[key]
      }
    }
    
    return opts
  }

  _logPageInUse(pageId) {
    this._pagesInUse[pageId] = Date.now()
  }

  _clearLogPageInUse(pageId) {
    delete this._pagesInUse[pageId]
  }

  _isAnyPageInUse() {
    return Boolean(Object.keys(this._pagesInUse).length)
  }

  _isBrowserOpenedTooLong() {
    return Date.now() - this._browserTimestamps >= SHOULD_CLOSE_BROWSER_AFTER
  }
}

const browserProvider = new BrowserProvider({
  headless: process.env.NODE_ENV === 'production'
})

module.exports = {
  BrowserProvider,
  browserProvider
}
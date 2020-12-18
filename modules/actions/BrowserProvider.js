const pupp = require("puppeteer");
const uuid = require("uuid").v1;
const { Browser } = require("puppeteer/lib/cjs/puppeteer/common/Browser");

const SHOULD_CLOSE_BROWSER_AFTER = 1000 * 60 * 60 * 16; // close browser if can after 16 hour

class BrowserProviderOptions {
  headless = true;
  browserTimeout = 0;
}

const DEFAULT_OPTIONS = {
  headless: false,
  browserTimeout: SHOULD_CLOSE_BROWSER_AFTER,
};

class BrowserProvider {
  constructor(opts) {
    let options = opts instanceof Object ? opts : {};
    this._options = this._bindDefaultOptions(options);

    /**
     * @type {Browser}
     */
    this._browser = null;
    this._browserTimestamps = 0;
    /**
     * @summary save all page key created by method getPage()
     */
    this._pagesInUse = {};
  }

  async lauchBrowser() {
    if (!this._browser || this._shouldCloseCurrentBrowser()) {
      await this.closeBrowser();
      this._browser = await pupp.launch(this._options);
      this._browserTimestamps = Date.now();
      this._browser.on("disconnected", () => this._clearCurrentBrowser());
    }
    return this._browser;
  }

  async getPage() {
    let browser = await this.lauchBrowser();
    let page = await browser.newPage();
    let pageId = uuid();
    page.pageId = pageId;

    this._logPageInUse(pageId);
    page.on("close", () => this._clearLogPageInUse(pageId));

    return page;
  }

  closeBrowser() {
    if (this._browser) {
      return this._browser.close().catch(() => {});
    }
  }

  _shouldCloseCurrentBrowser() {
    return this._isBrowserOpenedTooLong() && !this._isAnyPageInUse();
  }

  _clearCurrentBrowser() {
    this._browser = null;
    for (let pageId in this._pagesInUse) {
      this._clearLogPageInUse(pageId);
    }
  }

  /**
   *
   * @param {BrowserProviderOptions} opts
   * @returns {BrowserProviderOptions}
   */
  _bindDefaultOptions(opts) {
    for (let key in DEFAULT_OPTIONS) {
      if (opts[key] === undefined) {
        opts[key] = DEFAULT_OPTIONS[key];
      }
    }

    return opts;
  }

  _logPageInUse(pageId) {
    this._pagesInUse[pageId] = Date.now();
  }

  _clearLogPageInUse(pageId) {
    delete this._pagesInUse[pageId];
  }

  _isAnyPageInUse() {
    return Boolean(Object.keys(this._pagesInUse).length);
  }

  _isBrowserOpenedTooLong() {
    return this._options.browserTimeout
      ? Date.now() - this._browserTimestamps >= this._options.browserTimeout
      : false;
  }
}

const browserProvider = new BrowserProvider({
  headless: false,
});

/**
 *
 * @param {Boolean} headless
 */
function setBrowserHeadless(headless) {
  browserProvider._options.headless = Boolean(headless);
}

module.exports = {
  BrowserProvider,
  browserProvider,
  setBrowserHeadless,
};

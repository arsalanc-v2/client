/**
 * An object representing user info
 *
 * @typedef {Object} UserInfo
 * @property {string=} userid
 * @property {string=} displayName
 */

/**
 * An object representing document metadata
 *
 * @typedef {Object} DocMetadata
 * @property {string=} documentFingerprint - optional PDF fingerprint for
 *                     current document
 */

/**
 * An object representing document info
 *
 * @typedef {Object} DocumentInfo
 * @property {string=} url - current document URL
 * @property {DocMetadata} metadata - document metadata
 */

class VersionData {
  /**
   * @param {UserInfo} userInfo
   * @param {DocumentInfo} documentInfo
   * @param {Window} window_ - test seam
   * @return {VersionData}
   */
  constructor(userInfo, documentInfo, window_ = window) {
    const noValueString = 'N/A';
    const docMeta = documentInfo.metadata;

    let accountString = noValueString;
    if (userInfo.userid) {
      accountString = userInfo.userid;
      if (userInfo.displayName) {
        accountString = `${userInfo.displayName} (${accountString})`;
      }
    }

    this.timestamp = new Date().toString();
    this.url = documentInfo.uri || noValueString;
    this.fingerprint =
      docMeta && docMeta.documentFingerprint
        ? docMeta.documentFingerprint
        : noValueString;
    this.account = accountString;
    this.userAgent = window_.navigator.userAgent;
    this.version = '__VERSION__';
  }

  /**
   * Return a single formatted string representing version data, suitable for
   * copying to the clipboard.
   *
   * @return {string} - Single, multiline string representing current version data
   */
  asFormattedString() {
    let versionString = '';
    for (let prop in this) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        versionString += `${prop}: ${this[prop]}\r\n`;
      }
    }
    return versionString;
  }

  /**
   * Return a single, encoded URL string of version data suitable for use in
   * a querystring (as the value of a single parameter)
   *
   * @return {string} - URI-encoded string
   */
  asEncodedURLString() {
    return encodeURIComponent(this.asFormattedString());
  }
}

module.exports = VersionData;

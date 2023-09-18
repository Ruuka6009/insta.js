const User = require('./User');

/**
 * Represents the logged-in client's Instagram user.
 * @extends {User}
 */
class ClientUser extends User {
  /**
   * @param {Client} client The instantiating client
   * @param {object} data The data for the client user
   */
  constructor(client, data) {
    super(client, data);
    this.allowContactsSync = data.allowContactsSync;
    this.phoneNumber = data.phoneNumber;
  }

  /**
   * Change the bot's biography
   * @param {string} content The new biography
   * @returns {Promise<string>} The new biography
   */
  async setBiography(content) {
    await this.client.ig.account.setBiography(content);
    return (this.biography = content);
  }

  /**
   * Post a picture, with optional tagging
   * @param {Buffer} buffer The image buffer
   * @param {string} captiontxt The caption text
   * @param {string} [nametxt] The name to tag (optional)
   * @param {number} [x] The x-coordinate for the tag (optional)
   * @param {number} [y] The y-coordinate for the tag (optional)
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async postPicture(buffer, captiontxt, nametxt, x, y) {
    const postConfig = {
      file: buffer,
      caption: captiontxt,
    };

    if (nametxt && x !== undefined && y !== undefined) {
      const tag = await this.createTag(nametxt, x, y);
      postConfig.usertags = { in: [tag] };
    }

    const { status } = await this.client.ig.publish.photo(postConfig);
    return status === 'ok';
  }

  /**
   * Create a tag for a user
   * @param {string} name The name of the user to tag
   * @param {number} x The x-coordinate for the tag
   * @param {number} y The y-coordinate for the tag
   * @returns {Promise<object>} The tag object
   */
  async createTag(name, x, y) {
    const { pk } = await this.client.ig.user.searchExact(name);
    return {
      user_id: pk,
      position: [this.clamp(x), this.clamp(y)],
    };
  }

  clamp(value, min = 0.0001, max = 0.9999) {
    return Math.max(Math.min(value, max), min);
  }
}

module.exports = ClientUser;

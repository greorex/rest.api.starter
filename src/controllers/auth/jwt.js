import JWT from "jsonwebtoken";
import config from "../../../config";

const { auth } = config;

const _verify = async (token, secret) =>
  new Promise((resolve) => {
    JWT.verify(token, secret, (error, decoded) =>
      resolve(error ? error.name : decoded)
    );
  });

export default {
  /**
   * Creates JWT tokens
   * @param {Object} payload {user}
   * @returns {Object} tokens {access, refresh}
   */
  signin(payload) {
    const access = JWT.sign(payload, auth.secret, {
        algorithm: auth.algorithm,
        expiresIn: auth.expiresIn,
      }),
      refresh = JWT.sign({ access, payload }, auth.refreshSecret, {
        algorithm: auth.algorithm,
        expiresIn: auth.refreshExpiresIn,
      });

    return { authorization: { access, refresh } };
  },

  /**
   * Verifies JWT access token
   * @param {string} access token
   * @returns {Object} decoded payload
   */
  async access(access) {
    return _verify(access, auth.secret);
  },

  /**
   * Verifies JWT refresh tokens
   * @param {string} refresh token
   * @returns {Object} payload
   */
  async refresh(refresh) {
    const token = await _verify(refresh, auth.refreshSecret);
    if (!token) {
      return null;
    }
    const { access, payload } = token;
    if (!((await this.access(access)) && payload)) {
      return null;
    }
    return token;
  },
};

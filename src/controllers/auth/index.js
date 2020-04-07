import jwt from "./jwt";
import result from "../result";
import error from "../error";
import { Users, Op } from "../../models";
import { hashPassword } from "../../models/users";

/**
 * controller's exports
 */
export default {
  /**
   * Authorization by account
   * @param {Object} data {user, password}
   * @returns {Promise<Array>} [code, {authorization, refresh}]
   */
  async login({ user, password }) {
    if (!user) {
      return error(400, "invalid user");
    }

    if (!password) {
      return error(400, "invalid password");
    }

    const account = await Users.findOne(
      { where: { user, deletedAt: null } },
      { attributes: ["id", "password"] }
    );
    if (!account) {
      return error(404, "invalid account");
    }

    const hash = hashPassword(password);
    if (hash !== account.password) {
      return error(400, "invalid password");
    }

    const payload = {
      user,
    };

    const r = await Users.update(
      { loggedAt: new Date() },
      { where: { id: account.id } }
    );
    if (!r) {
      return error(500, "can not login, please try again");
    }

    return result(200, jwt.signin(payload));
  },

  /**
   * New authorization by refresh token
   * @param {string} refresh token
   * @returns {Promise<Array>} [code, {access, refresh}]
   */
  async refresh(refresh) {
    const token = await jwt.refresh(refresh);
    if (!token) {
      return error(400, "invalid authorization");
    }

    if (token === "TokenExpiredError") {
      return error(401, "authorization expired");
    }

    const { payload } = token,
      { user } = payload,
      account = await Users.findOne({
        where: {
          user,
          deletedAt: null,
          loggedAt: {
            [Op.ne]: null,
          },
        },
        attributes: ["id"],
      });

    if (!account) {
      return error(401, "unauthorized");
    }

    return result(200, jwt.signin(payload));
  },

  /**
   * Marks account as unauthorized
   * @param {*} id internal identifier
   * @returns {Promise<Array>} [code, response]
   */
  async logout(id) {
    const user = await Users.findOne({ where: { id, deletedAt: null } });
    if (!user) {
      return error(404, "not found");
    }

    const r = await Users.update({ loggedAt: null }, { where: { id } });
    if (!r) {
      return error(500, "can not logout, please try again");
    }

    return result(200, r);
  },
};

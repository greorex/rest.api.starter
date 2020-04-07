import jwt from "./auth/jwt";
import result from "./result";
import error from "./error";
import { Users } from "../models";

/**
 * controller's exports
 */
export default {
  /**
   * Creates a new account
   * @param {Object} data - {id, password}
   * @returns {Promise<Array>} [code, response]
   */
  async create(data) {
    const { user, password } = data;

    if (!user) {
      return error(400, "invalid user");
    }

    if (!password) {
      return error(400, "invalid password");
    }

    if (
      await Users.findOne(
        { where: { user, deletedAt: null } },
        { attributes: ["id"] }
      )
    ) {
      return error(409, "already exists");
    }

    const created = await Users.create({
      ...data,
      createdAt: new Date(),
      loggedAt: new Date(),
    });
    if (!created) {
      return error(500, "can not create, please try again");
    }

    const payload = {
      user,
    };

    return result(201, jwt.signin(payload));
  },

  /**
   * Retrives account id
   * @param {*} id - internal identifier
   * @returns {Promise<Array>} [code, response]
   */
  async read(id) {
    const user = await Users.findOne(
      {
        where: { id },
      },
      { attributes: ["user"] }
    );

    return user ? result(200, user) : error(404, "not found");
  },

  /**
   * Updates account password
   * @param {Object} data - {internal identifier, password}
   * @returns {Promise<Array>} [code, response]
   */
  async update({ id, password }) {
    if (!password) {
      return error(400, "invalid password");
    }

    const user = await Users.findOne({ where: { id } }, { attributes: ["id"] });
    if (!user) {
      return error(404, "not found");
    }

    const r = await Users.update(
      {
        password,
        updatedAt: new Date(),
      },
      { where: { id } }
    );
    if (!r) {
      return error(500, "can not update, please try again");
    }

    return result(200, r);
  },

  /**
   * Marks account as deleted
   * @param {*} id - internal identifier
   * @returns {Promise<Array>} [code, response]
   */
  async delete(id) {
    const user = await Users.findOne(
      { where: { id, deletedAt: null } },
      { attributes: ["id"] }
    );
    if (!user) {
      return error(404, "not found");
    }

    const r = await Users.update(
      { password: null, deletedAt: new Date(), loggedAt: null },
      { where: { id } }
    );
    if (!r) {
      return error(500, "can not delete, please try again");
    }

    return result(200, r);
  },
};

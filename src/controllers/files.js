import result from "./result";
import error from "./error";
import path from "path";
import fs from "fs";
import { Files, sequelize } from "../models";
import config from "../../config";

const { storage } = config;

/**
 * controller's exports
 */
export default {
  /**
   * Queries a list of files
   * @param {Object} data
   * @returns {Promise<Array>} [code, response]
   */
  async list(data) {
    const page = data.page || 1,
      listSize = data.listSize || 10;

    return Files.findAll({
      where: { deletedAt: null },
      offset: (page - 1) * listSize,
      limit: page * listSize,
    });
  },

  /**
   * Uploads files
   * @param {Object} { owner, files }
   * @returns {Promise<Array>} [code, response]
   */
  async create({ owner, files }) {
    if (!files || files.length < 1) {
      return error(400, "invalid file(s)");
    }

    const ext = (filename) => path.extname(filename),
      name = (filename) => path.basename(filename, ext(filename)),
      createdAt = new Date();

    const r = await sequelize.transaction(
      async (transaction) =>
        await Files.bulkCreate(
          files.map(({ filename: id, originalname, mimetype, size }) => ({
            id,
            name: name(originalname),
            ext: ext(originalname),
            mimetype,
            size,
            owner,
            createdAt,
          })),
          { transaction }
        )
    );

    return r ? result(201, r) : error(500, "can not upload, please try again");
  },

  /**
   * Updates file with file(s)
   * @param {Object} data
   * @returns {Promise<Array>} [code, response]
   */
  async update({ owner, id, files }) {
    if (!files || files.length != 1) {
      return error(400, "invalid file(s)");
    }

    const file = await Files.findOne({ where: { id } });
    if (!file) {
      return error(404, "not found");
    }

    if (file.owner !== owner) {
      return error(403, "access denied");
    }

    const r = await sequelize.transaction(async (transaction) => {
      const { size, mimetype, filename } = files[0],
        location = path.join(storage.path, file.id),
        r = await Files.update(
          {
            size,
            mimetype,
            updatedAt: new Date(),
          },
          { where: { id } },
          { transaction }
        );

      return !r
        ? false
        : await new Promise((resolve) => {
            fs.rename(filename, location, (err) =>
              resolve(err ? (console.log(err), false) : true)
            );
          });
    });

    return r ? result(200, r) : error(500, "can not update, please try again");
  },

  /**
   * Retrives file information
   * @param {*} id
   * @returns {Promise<Array>} [code, response]
   */
  async read(id) {
    const file = await Files.findOne({
      where: { id },
    });

    return file ? result(200, file) : error(404, "not found");
  },

  /**
   * Removes file
   * @param {Object} { owner, id }
   * @returns {Promise<Array>} [code, response]
   */
  async delete({ owner, id }) {
    const file = await Files.findOne(
      { where: { id } },
      { attributes: ["id", "owner"] }
    );
    if (!file) {
      return error(404, "not found");
    }

    if (file.owner !== owner) {
      return error(403, "access denied");
    }

    const r = await sequelize.transaction(async (transaction) => {
      const location = path.join(storage.path, file.id),
        r = await Files.destroy(
          {
            where: { id },
          },
          { transaction }
        );

      return !r
        ? false
        : await new Promise((resolve) => {
            fs.unlink(location, (err) =>
              resolve(err ? (console.log(err), false) : true)
            );
          });
    });

    return r ? result(200, r) : error(500, "can not delete, please try again");
  },
};

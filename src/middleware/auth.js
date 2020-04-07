import jwt from "../controllers/auth/jwt";
import { Users, Op } from "../models";

export default () => async (request, response, next) => {
  const reject = (code, data) => response.status(code).send(data).end();

  let access =
    request.headers["x-access-token"] || request.headers["authorization"];

  if (!(access && access.startsWith("Bearer "))) {
    return reject(400, "invalid authorization");
  }

  access = access.slice(7, access.length);

  let token = await jwt.access(access);
  if (!token) {
    return reject(400, "invalid authorization");
  }

  if (token === "TokenExpiredError") {
    return reject(401, "authorization expired");
  }

  const { user } = token,
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
    return reject(401, "unauthorized");
  }

  request.user = { id: account.id, user };

  return next();
};

import Reply from "./reply";
import users from "../controllers/users";
import verify from "../middleware/auth";
import { Router } from "express";

const reply = Reply(users),
  router = Router(),
  handler = {
    post: (request, response) => {
      const { id: user, password } = request.body;
      return reply.create({ user, password }, response);
    },

    get: (request, response) => {
      const { user } = request.user;
      return response.status(200).send(user);
    },

    put: (request, response) => {
      const { id } = request.user;
      const { password } = request.body;
      return reply.update({ id, password }, response);
    },

    delete: (request, response) => {
      const { id } = request.user;
      return reply.delete(id, response);
    },
  };

router.post("/signup", handler.post);
router.get("/user", verify(), handler.get);

export default router;

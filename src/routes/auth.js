import Reply from "./reply";
import auth from "../controllers/auth";
import verify from "../middleware/auth";
import { Router } from "express";

const reply = Reply(auth),
  router = Router(),
  handler = {
    login: (request, response) => {
      const { id: user, password } = request.body;
      return reply.login({ user, password }, response);
    },

    refresh: (request, response) => {
      const { refresh } = request.body;
      return reply.refresh(refresh, response);
    },

    logout: (request, response) => {
      const { id } = request.user;
      return reply.logout(id, response);
    },
  };

router.post("/signin", handler.login);
router.post("/signin/refresh", handler.refresh);
router.get("/logout", verify(), handler.logout);

export default router;

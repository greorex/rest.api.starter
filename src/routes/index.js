import { Router } from "express";
import auth from "./auth";
import users from "./users";
import files from "./files";

const router = Router();

router.use("/", auth);
router.use("/", users);
router.use("/file", files);

export default router;

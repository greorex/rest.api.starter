import Reply from "./reply";
import files from "../controllers/files";
import verify from "../middleware/auth";
import { Router } from "express";
import multer from "multer";
import uuid from "uuid/v4";
import path from "path";
import fs from "fs";
import config from "../../config";

const { storage } = config;

const reply = Reply(files),
  router = Router(),
  upload = multer({
    storage: multer.diskStorage({
      destination: (_, __, f) => f(null, storage.path),
      filename: (_, __, f) => f(null, uuid()),
    }),
  }),
  handler = {
    list: (request, response) => reply.list(request.query, response),

    post: (request, response) => {
      const { user: owner } = request.user;
      return reply.create(
        { owner, ...request.body, files: request.files },
        response
      );
    },

    put: (request, response) => {
      const { user: owner } = request.user;
      const { id } = request.params;
      return reply.update(
        { owner, id, ...request.body, files: request.files },
        response
      );
    },

    get: (request, response) => {
      const { id } = request.params;
      return reply.read(id, response);
    },

    delete: (request, response) => {
      const { user: owner } = request.user;
      const { id } = request.params;
      return reply.delete({ owner, id }, response);
    },

    download: (request, response) => {
      const { id } = request.params;
      return reply.read(id, response, (code, file) => {
        if (code !== 200) {
          return false;
        }

        response.setHeader(
          "Content-Disposition",
          `attachment; filename=${file.name}${file.ext}`
        );
        const stream = fs.createReadStream(path.join(storage.path, file.id));
        stream.pipe(response);
        stream.on("error", (error) => {
          throw new Error(error);
        });

        return true;
      });
    },
  };

router.use(verify());

router.get("'/list", handler.list);
router.post("/upload", upload.any(), handler.post);
router.put("/update/:id", upload.any(), handler.put);
router.get("/download/:id", handler.download);
router.get("/:id", handler.get);
router.delete("/delete/:id", handler.delete);

export default router;

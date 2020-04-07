import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import camelCase from "./middleware/camel";
import omitEmpty from "./middleware/empty";
import { sequelize } from "./models";
import routes from "./routes";
import config from "../config";

const { server, database } = config;

const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(compression());

if (server.camelCase) {
  app.use(camelCase({ deep: true }));
}

if (server.omitEmpty) {
  app.use(omitEmpty());
}

if (!server.production) {
  app.use(morgan("dev"));
}

app.use("/", routes);
app.use("/*", (_, response) => response.status(404).end());

sequelize.sync({ force: database.sync }).catch((error) => {
  console.log(error.original);
  process.exit(1);
});

app.listen(server.port);

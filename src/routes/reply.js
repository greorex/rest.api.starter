import config from "../../config";

const { server } = config;

/**
 * Factory for reply
 * @param {*} controller
 * @returns {Proxy} controller's proxy
 */
export default (controller) =>
  new Proxy(controller, {
    get: (t, prop) => async (param, response, send = null) => {
      try {
        const [code, data] = await t[prop](param);
        response.status(code);
        if (!(send && (await send(code, data)))) {
          response.send(data);
        }
        return response.end();
      } catch (error) {
        return response
          .status(500)
          .send(
            "internal server error" + (server.production ? "" : `: ${error}`)
          )
          .end();
      }
    },
  });

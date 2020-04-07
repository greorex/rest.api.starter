import camelCase from "camelcase-keys";

export default (options) => (request, _, next) => {
  request.body = camelCase(request.body, options);
  request.params = camelCase(request.params);
  request.query = camelCase(request.query);

  return next();
};

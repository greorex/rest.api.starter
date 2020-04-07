import omitEmpty from "omit-empty";

export default () => (request, _, next) => {
  request.body = omitEmpty(request.body);
  request.params = omitEmpty(request.params);
  request.query = omitEmpty(request.query);

  return next();
};

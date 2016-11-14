declare module "jsonp" {
  function jsonp(url: string, opts?: any, fn?: () => void): () => void;
  namespace jsonp {}
  export = jsonp;
}

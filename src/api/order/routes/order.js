"use strict";

/**
 * order router.
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

// module.exports = createCoreRouter('api::order.order');
const defaultRouter = createCoreRouter("api::order.order");

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

const myExtraRoutes = [
  {
    method: "POST",
    path: "/orders/confirm",
    handler: "api::order.order.confirm",
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);

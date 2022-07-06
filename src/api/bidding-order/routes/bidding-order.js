"use strict";
/**
 * bidding-order router.
 */
const { createCoreRouter } = require("@strapi/strapi").factories;
// module.exports = createCoreRouter('api::bidding-order.bidding-order');
const defaultRouter = createCoreRouter("api::bidding-order.bidding-order");
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
    path: "/bidding-orders/confirm",
    handler: "api::bidding-order.bidding-order.confirm",
  },
  {
    method: "POST",
    path: "/bidding-orders/sendMail",
    handler: "api::bidding-order.bidding-order.sendMail",
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);

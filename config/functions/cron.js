module.exports = {
  "0 0/1 * 1/1 * ? *": async ({ strapi }) => {
    console.log("at 3:27");
    const biddingItems = await strapi
      .service("api::bidding-item.bidding-item")
      .find({
        populate: "*",
        filters: {
          status: "approved",
        },
      });
    var sanitizedEntity = await this.sanitizeOutput(biddingItems, ctx);
    return this.transformResponse(sanitizedEntity);
  },
};

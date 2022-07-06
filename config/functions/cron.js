module.exports = {
  "0 0 12 ? 1/1 MON#1 *": async () => {
    const bidItems = await strapi.db
      .query("api::bidding-item.bidding-item")
      .findMany({
        populate: "*",
        where: {
          highest_bidder: {
            id: {
              $notNull: true,
            },
          },
        },
      });

    bidItems.map(async (item) => {
      console.log("bidder email: ", item.highest_bidder.email);
      await strapi.service("api::bidding-order.bidding-order").sendMail({
        data: {
          to: item.highest_bidder.email,
        },
      });
    });
  },
};

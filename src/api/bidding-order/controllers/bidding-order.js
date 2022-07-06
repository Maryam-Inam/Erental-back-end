"use strict";

/**
 *  bidding-order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(process.env.STRIPE_SK);
const fromDecimalToInt = (number) => parseInt(number * 100);

module.exports = createCoreController(
  "api::bidding-order.bidding-order",
  ({ strapi }) => ({
    async create(ctx) {
      const {
        biddingItem,
        userid,
        itemPrice,
        shipping_detail,
        shippingPrice,
        taxFee,
        total,
      } = ctx.request.body.data;

      if (!biddingItem) {
        return ctx.throw(400, "please specify a request quote");
      }

      const realProduct = await strapi
        .service("api::bidding-item.bidding-item")
        .findOne(biddingItem, {
          populate: "*",
        });
      console.log(realProduct.name);
      if (!realProduct) {
        return ctx.throw(404, "No product with such id");
      }
      ``;
      const { user } = ctx.state;
      const BASE_URL = ctx.request.headers.origin || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: user.email,
        mode: "payment",
        success_url: `${BASE_URL}/biddingpayment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: BASE_URL,
        customer_creation: "if_required",
        line_items: [
          {
            price_data: {
              currency: "pkr",
              product_data: {
                name: realProduct.name,
              },
              unit_amount: fromDecimalToInt(total),
            },
            quantity: 1,
          },
        ],
      });
      const shippingDetail = await strapi
        .service("api::shipping-detail.shipping-detail")
        .findOne(shipping_detail);

      // creatign order
      const newOrder = await strapi
        .service("api::bidding-order.bidding-order")
        .create({
          data: {
            user: user,
            bidding_item: biddingItem,
            amount: total,
            total_amount: {
              bid_price: itemPrice,
              shipping_fee: shippingPrice,
              tax_fee: taxFee,
              total: total,
            },
            status: "unpaid",
            checkout_session: session.id,
            shipping_detail: shippingDetail.id,
            delivered: "no",
          },
        });
      return {
        id: session.id,
      };
    },
    async confirm(ctx) {
      const { checkout_session } = ctx.request.body.data;
      const session = await stripe.checkout.sessions.retrieve(checkout_session);
      let query = {
        filters: {
          checkout_session: checkout_session,
        },
      };
      const data = await strapi.entityService.findMany(
        "api::bidding-order.bidding-order",
        query
      );
      if (session.payment_status === "paid") {
        const updateOrder = await strapi
          .service("api::bidding-order.bidding-order")
          .update(data[0].id, {
            data: {
              status: "paid",
            },
          });
        var sanitizedEntity = await this.sanitizeOutput(updateOrder, ctx);
      } else {
        const deleteOrder = await strapi
          .service("api::bidding-order.bidding-order")
          .delete(data[0].id);
        sanitizedEntity = await this.sanitizeOutput(deleteOrder, ctx);
        ctx.throw(400, "The payment wasn't successful, please call support");
      }
      return this.transformResponse(sanitizedEntity);
    },
    async sendMail(ctx) {
      let query = {
        filters: {
          email: ctx.request.body.data.to,
        },
      };
      const user = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        query
      );
      if (!user) {
        return ctx.throw(404, "No user with such email");
      }
      const res = await strapi.plugins["email"].services.email.send({
        to: ctx.request.body.data.to,
        from: "erental@eastdevs.com",
        replyTo: "arose@eastdevsF.com",
        subject: "Highest bidder selection",
        text: `Congratulations, you have won the highest bid! click on http://localhost:3000/wonBids to check your winning`,
      });
      return `mail sent to ${ctx.request.body.data.to}`;
    },
  })
);

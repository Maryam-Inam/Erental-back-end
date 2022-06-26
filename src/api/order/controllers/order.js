"use strict";
const { sanitizeEntity } = require("strapi-utils/lib");
/**
 *  order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(process.env.STRIPE_SK);
const fromDecimalToInt = (number) => parseInt(number * 100);

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { request_quote, total, shipping_detail } = ctx.request.body.data;

    if (!request_quote) {
      return ctx.throw(400, "please specify a request quote");
    }

    const acceptedQuote = await strapi
      .service("api::request-quote.request-quote")
      .findOne(request_quote, {
        populate: "*",
      });
    const realProduct = acceptedQuote.product;
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
      success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE_URL,
      customer_creation: "if_required",
      // shipping_options: [
      //   {
      //     shipping_rate_data: {
      //       type: "fixed_amount",
      //       fixed_amount: {
      //         amount: 0,
      //     currency: "usd",
      //   },
      //   display_name: "Free shipping",
      //   //   # Delivers between 5-7 business days
      //   delivery_estimate: {
      //     minimum: {
      //       unit: "business_day",
      //       value: 5,
      //     },
      //     maximum: {
      //       unit: "business_day",
      //       value: 7,
      //     },
      //   },
      // },
      // },
      // {
      //   shipping_rate_data: {
      //     type: "fixed_amount",
      //     fixed_amount: {
      //       amount: 1500,
      //       currency: "usd",
      //     },
      //     display_name: "Next day air",
      //     //   # Delivers in exactly 1 business day
      //     delivery_estimate: {
      //       minimum: {
      //           unit: "business_day",
      //           value: 1,
      //         },
      //         maximum: {
      //           unit: "business_day",
      //           value: 1,
      //         },
      //       },
      //     },
      //   },
      // ],
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

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: total,
    //   currency: "usd",
    //   payment_method: "pm_card_visa",
    //   //   customer: user,
    //   shipping: {
    //     name: realProduct.users_permissions_user.username,
    //     address: {
    //       city: shippingDetail.city,
    //       country: shippingDetail.country,
    //       postal_code: shippingDetail.postal_code,
    //     },
    //     phone: realProduct.users_permissions_user.contact_number,
    //   },
    // });
    // creatign order
    const newOrder = await strapi.service("api::order.order").create({
      data: {
        user: user,
        request_quote: request_quote,
        total: total,
        status: "unpaid",
        checkout_session: session.id,
        shipping_detail: shippingDetail.id,
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
    const data = await strapi.entityService.findMany("api::order.order", query);
    if (session.payment_status === "paid") {
      const updateOrder = await strapi
        .service("api::order.order")
        .update(data[0].id, {
          data: {
            status: "paid",
          },
        });
      var sanitizedEntity = await this.sanitizeOutput(updateOrder, ctx);
    } else {
      const deleteOrder = await strapi
        .service("api::order.order")
        .delete(data[0].id);
      sanitizedEntity = await this.sanitizeOutput(deleteOrder, ctx);
      ctx.throw(400, "The payment wasn't successful, please call support");
    }
    return this.transformResponse(sanitizedEntity);
  },
}));

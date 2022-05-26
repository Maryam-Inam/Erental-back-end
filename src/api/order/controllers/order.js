"use strict";

/**
 *  order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(process.env.STRIPE_SK);
const fromDecimalToInt = (number) => parseInt(number * 100);

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { product, total, user, shipping_detail } = ctx.request.body.data;

    //     const { status, total, checkout_session } = JSON.parse(
    //         ctx.request.body
    //     );
    //     console.log("total")
    // const stripeAmount = Math.floor(total * 100);
    // // charge on stripe
    // const charge = await stripe.charges.create({
    //   // Transform cents to dollars.
    //   amount: stripeAmount,
    //   currency: "usd",
    //   description: `Order ${new Date()} by ${ctx.state.user._id}`,
    //   source: checkout_session,
    // });

    // // Register the order in the database
    // const entity = await strapi.service('api::order.order').create({
    //   data:
    //     {
    //       user: ctx.state.user.id,
    //       checkout_session: charge.id,
    //       total: stripeAmount,
    //       status:'unpaid'
    //     }
    // });

    // const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    // return this.transformResponse(sanitizedEntity);

    if (!product) {
      return ctx.throw(400, "please specify a product");
    }

    const realProduct = await strapi
      .service("api::product.product")
      .findOne(product, {
        populate: "*",
      });
    // if (!realProduct) {
    //   return ctx.throw(404, "No product with such id");
    // }

    // const { user } = ctx.state;
    // const BASE_URL = ctx.request.headers.origin || "http://localhost:3000";

    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   customer_email: user.email,
    //   mode: "payment",
    //   success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: BASE_URL,
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: "usd",
    //         product_data: {
    //           name: realProduct.name,
    //         },
    //         unit_amount: fromDecimalToInt(realProduct.rent),
    //       },
    //       quantity: 1,
    //     },
    //   ],
    // });
    const shippingDetail = await strapi
      .service("api::shipping-detail.shipping-detail")
      .findOne(shipping_detail);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      payment_method: "pm_card_visa",
      //   customer: user,
      shipping: {
        name: realProduct.users_permissions_user.username,
        address: {
          city: shippingDetail.city,
          country: shippingDetail.country,
          postal_code: shippingDetail.postal_code,
        },
        phone: realProduct.users_permissions_user.contact_number,
      },
    });
    // // creatign order
    // const newOrder = await strapi.service("api::order.order").create({
    //   user: user.id,
    //   product: realProduct.id,
    //   total: realProduct.price,
    //   status: "unpaid",
    //   checkout_session: session.id,
    // });
    return {
      paymentIntent,
    };
  },
}));
// 		console.log("query", ctx.params);
// 		const response = await super.delete(ctx);
// 		console.log(response);
// 		if (response) {
// 			console.log(response.data);
// 			if (response.data) {
// 				console.log(response.data.attributes);
// 				const { user } = response.data.attributes;
// 				if (user.data) {
// 					console.log(user);
// 					await strapi.service('plugin::users-permissions.user').remove({ id: user.data.id });
// 				}
// 			}
// 		}
// 		return response;
// 	},
// }));

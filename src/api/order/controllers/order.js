"use strict";
const { sanitizeEntity } = require("strapi-utils/lib");
/**
 *  order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(process.env.STRIPE_SK);
// const stripe =
//   "sk_test_51L21M9CkQckw00Wv8YIga3b2DrIzZtbE8jtBttc8vQlAk889eKRc5uOMzN78etnuEK5EdwhQ1Uv2zJfrxmUPJqyw00cqukJybh";
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
    if (!realProduct) {
      return ctx.throw(404, "No product with such id");
    }

    // const { user } = ctx.state;
    const BASE_URL = ctx.request.headers.origin || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE_URL,
      shipping_address_collection: {
        allowed_countries: ["US", "PK"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free shipping",
            //   # Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1500,
              currency: "usd",
            },
            display_name: "Next day air",
            //   # Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: "usd",
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
    // creatign order
    const newOrder = await strapi.service("api::order.order").create({
      data: {
        user: user,
        product: realProduct.id,
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
    if (session.payment_status === "paid") {
      const updateOrder = await strapi.service("api::order.order").update(
        {
          checkout_session,
        },
        {
          status: "paid",
        }
      );
      // return { session };
      return sanitizeEntity(updateOrder, { model: strapi.models.order });
    } else {
      ctx.throw(400, "The payment wasn't successful, please call support");
    }
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

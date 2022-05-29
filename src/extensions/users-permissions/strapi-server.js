module.exports = (plugin) => {
  async function sendMail(ctx) {
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
      subject: "My message",
      text: `Your password is ${user[0].admin_password}, click on http://localhost:3000/login and enter your password`,
    });
    return "You have been sent an email to recover password, look forward to your email, please.";
  }
  plugin.controllers.auth.returnPassword = (ctx) => {
    console.log("test");
    try {
      return sendMail(ctx);
    } catch {
      return ctx.throw("it failed");
    }
  };
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/returnPassword",
    handler: "auth.returnPassword",
    config: {
      prefix: "",
    },
  });
  return plugin;
};

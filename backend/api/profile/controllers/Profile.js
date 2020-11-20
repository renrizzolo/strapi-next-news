const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async create(ctx) {
    console.log("is create profile", ctx);
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.profile.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.profile.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.profile });
  },

  /**
   * Update a record.
   *
   * @return {Object}
   */

  async update(ctx) {
    const { id } = ctx.params;
    console.log(ctx.params);
    let entity;

    const [profile] = await strapi.services.profile.find({
      id: 1,
      "user.id": ctx.state.user.id,
    });

    if (!profile) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.profile.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.profile.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.profile });
  },
};

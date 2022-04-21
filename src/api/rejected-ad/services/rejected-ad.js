'use strict';

/**
 * rejected-ad service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::rejected-ad.rejected-ad');

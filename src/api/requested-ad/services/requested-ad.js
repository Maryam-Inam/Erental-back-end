'use strict';

/**
 * requested-ad service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::requested-ad.requested-ad');

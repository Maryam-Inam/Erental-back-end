'use strict';

/**
 * request-quote service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::request-quote.request-quote');

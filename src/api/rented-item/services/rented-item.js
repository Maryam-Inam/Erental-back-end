'use strict';

/**
 * rented-item service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::rented-item.rented-item');

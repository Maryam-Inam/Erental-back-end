// module.exports = [
//   'strapi::errors',
//   {
//     name: 'strapi::security',
//     config: {
//       contentSecurityPolicy: {
//         useDefaults: true,
//         directives: {
//           'connect-src': ["'self'", 'https:'],
//           'img-src': ["'self'", 'data:', 'blob:', 'rental-electronics-images.s3.ap-south-1.amazonaws.com'],
//           'media-src': ["'self'", 'data:', 'blob:'],
//           upgradeInsecureRequests: null,
//         },
//       },
//     },
//   },
//   // 'strapi::security',
//   'strapi::cors',
//   'strapi::poweredBy',
//   'strapi::logger',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];
module.exports = [
  "strapi::errors",
  // {
  //   settings: {
  //     parser: {
  //       enabled: true,
  //       multipart: true,
  //       formidable: {
  //         maxFileSize: 5 * 1024 * 1024 * 1024,
  //       },
  //     },
  //   },
  // },
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "rental-electronics-images.s3.ap-south-1.amazonaws.com",
          ],
          "media-src": ["'self'", "data:", "blob:"],
          upgradeInsecureRequests: null,
        },
      },
      // formLimit: "256mb", // modify form body
      // jsonLimit: "256mb", // modify JSON body
      // textLimit: "256mb", // modify text body
      // formidable: {
      //   maxFileSize: 200 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      // }
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  'strapi::session',
  "strapi::favicon",
  "strapi::public",
];

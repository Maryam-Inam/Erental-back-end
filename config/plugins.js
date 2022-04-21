// module.exports = ({ env }) => ({
//   email: {
//     config: {
//       provider: 'sendgrid',
//       providerOptions: {
//         apiKey: env('SENDGRID_API_KEY'),
//       },
//       settings: {
//         defaultFrom: 'maryaminam00@gmail.com',
//         defaultReplyTo: 'maryaminam00@gmail.com',
//       },
//     },
//   },
// });

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
        region: 'ap-south-1',
        params: {
          Bucket: 'rental-electronics-images',
        },
      },
    },
  },
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        apiKey: env('MAILGUN_API_KEY'),
        domain: env('MAILGUN_DOMAIN'), //Required if you have an account with multiple domains
        host: env('MAILGUN_HOST', 'api.mailgun.net'), //Optional. If domain region is Europe use 'api.eu.mailgun.net'
      },
      settings: {
        defaultFrom: 'erental@eastdevs.com',
        defaultReplyTo: 'arose@eastdevsF.com',
      },
    },
  },
  // ...
});
module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '537a77275e534238028ef7cc2cee6309'),
  },
});

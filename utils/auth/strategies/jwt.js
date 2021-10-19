const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const boom = require("boom");
const { config } = require("../../../config");
const UsersService = require("../../../services/users");

passport.use(
  new Strategy(
    {
      secretOrKey: config.authJwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async function(tokenPayload, cb) {
      const usersService = new UsersService();
      
      try {
        const user = await usersService.getUser({
          email: tokenPayload.email
        });

        if (!user) {
          return cb(boom.unauthorized(), false);
        }

        delete user.password;
        
        return cb(null, {...user, scopes: tokenPayload.scopes });
      } catch (error) {
        return cb(error);
      }
    }
  )
);

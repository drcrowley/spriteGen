var passport       = require('passport');


module.exports = function(req, res, next) {

    console.log('someone trying to login');

    passport.authenticate('local',
        function(err, user, info) {
            console.log('user:', user);
            return err
                ? next(err)
                : user
                ? req.logIn(user, function(err) {
                return err
                    ? next(err)
                    : res.redirect('/private');
            })
                : res.redirect('/fail');
        }
    )(req, res, next);

};
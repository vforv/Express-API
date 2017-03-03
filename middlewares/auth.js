var status = require('http-status');

module.exports = function(User) {
	return {
		authenticated: function(req,res,next) {
		var token = req.get('Auth');

		User.findByToken(token)
			.then(function(user) {
				req.user = user.toPublicJSON();
				next();
			})
			.catch(function(err) {
				return res
					.status(status.UNAUTHORIZED)
					.json({"error" : "Invalid token"})
			});
	}
}
};
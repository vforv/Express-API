var httpStatus = require('http-status');

function handlerWrapper() {

    var handle = {
        /**
         * 
         * For Modal.findOne()
         * 
         * @param {String} property Custom string
         * @param {Response} res
         * @param {type} error
         * @param {type} result
         * @returns {unresolved}
         */
        one: function (property, res, error, result) {
            if (error) {
                return res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({message: error.toString()});
            }

            if (!result) {
                return res
                        .status(httpStatus.NOT_FOUND)
                        .json({message: property + ' not found'});
            }

            var json = {};
            json[property] = result;
            res.json(json);
        },
        /**
         * 
         * For Modal.find()
         * 
         * @param {String} property Custom string
         * @param {Response} res
         * @param {type} error
         * @param {type} result
         * @returns {unresolved}
         */
        many: function (property, res, error, result) {

            if (error) {
                return res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({message: error.toString()});
            }

            var json = {};
            json[property] = result;
            res.json(json);
        },
        /**
         * 
         * For Modal.update()
         * 
         * @param {String} property Custom string
         * @param {Response} res
         * @param {type} error
         * @param {type} result
         * @returns {unresolved}
         */
        updateOne: function (property, res, error, result) {
            if (error) {
                return res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({message: error.toString()});
            }

            return res
                    .status(httpStatus.OK)
                    .json({message: 'You have successfully updated your ' + property + ' information.'});

        },
        
        /**
         * 
         * For Modal.create()
         * 
         * @param {String} property Custom string
         * @param {Response} res
         * @param {type} error
         * @param {type} result
         * @returns {unresolved}
         */
        createOne: function (property, res, error, result) {
            if (error) {
                return res
                        .status(httpStatus.INTERNAL_SERVER_ERROR)
                        .json({message: error.toString()});
            }

            return res
                    .status(httpStatus.OK)
                    .json({message: 'You have successfully added ' + property + '.'});

        }
    };

    return handle;
}

module.exports = handlerWrapper;
var exports = module.exports = {};
var lwip = require('lwip');

exports.scale = function(buffer, imageType, ratio, callback) {
    lwip.open(buffer, imageType, function (err, image) {

        if (err) {
            console.log("error", err);
            callback(err, image);
        } else {
            image.batch()
                .scale(ratio)
                .toBuffer(imageType, function (err, image) {
                    callback(err, image)
                });
        }
    });
}
var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var lwip = require('lwip');
var imageHelper = require('helpers/image-helper');
var request = require('request').defaults({encoding: null});

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/api/image/upload" enctype="multipart/form-data" method="post">' +
        '<input type="file" name="upload"><br>' +
        '<input type="submit" value="Upload">' +
        '</form>'
    );
});

router.get("/scale", function (req, res, next) {
    var url = req.query.imageUrl;
    var imageType = req.query.imageType || extractImageTypeFromFileName(url);
    var ratio = parseFloat(req.query.ratio);

    request.get(url, function (err, imageReq, data) {
        imageHelper.scale(data, imageType, ratio, function (err, image) {
            res.end(buffer)
        });

        /*lwip.open(data, imageType, function (err, image) {
            console.log("error", err);
            image.batch()
                .scale(ratio)
                .toBuffer(imageType, function (err, buffer) {
                    res.end(buffer)
                });
        });*/
    });
});

router.post('/upload', function (req, res, next) {
    var form = new multiparty.Form();

    form.on('part', function (part) {
        var bufs = [];

        var imageType = extractImageType(part);
        console.log("Image Type", imageType);

        part.on("data", function (data) {
            console.log("data", data);
            bufs.push(data);
        });

        part.on("end", function () {
            var buffer = Buffer.concat(bufs);

            lwip.open(buffer, imageType, function (err, image) {
                image.batch()
                    .scale(0.5)
                    .toBuffer(imageType, function (err, buffer) {
                        res.end(buffer)
                        //console.log(err);
                    });
            });
        });

        part.resume();

    });
    form.parse(req);
});

function extractImageTypeFromContentType(part) {
    var contentType = part.headers["content-type"];
    return contentType.substring(contentType.indexOf('/') + 1);
}

function extractImageTypeFromFileName(filename) {
    return filename.split('.').pop();
}


module.exports = router;

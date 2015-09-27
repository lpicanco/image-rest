var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var lwip = require('lwip');


/* GET users listing. */
router.get("/", function (req, res, next) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/images/upload" enctype="multipart/form-data" method="post">' +
        '<input type="file" name="upload"><br>' +
        '<input type="submit" value="Upload">' +
        '</form>'
    );
});

router.post('/upload', function (req, res, next) {
    var form = new multiparty.Form();

    var destPath;
    form.on('field', function (name, value) {
        console.log("name: ", name);
        console.log("value: ", value);
        if (name === 'path') {
            destPath = value;
        }
    });
    form.on('part', function (part) {
        console.log("Received bytes count: ", part.byteCount)
        //console.log("Received bytes raw: ", part)
        var bufs = [];

        part.on("data", function (data) {
            //console.log("Received bytes raw: ", data)
            bufs.push(data);
        });

        part.on("end", function () {
            console.log("End stream")
            var buffer = Buffer.concat(bufs);

            lwip.open(buffer, "jpg", function (err, image) {
                console.log("Errors: ", err);
                image.batch()
                    .scale(0.1)
                    .toBuffer("jpg", function (err, buffer) {
                        res.end(buffer)
                        console.log(err);
                    });
            });
        });

        part.resume();


        /*
         s3Client.putObject({
         Bucket: bucket,
         Key: destPath,
         ACL: 'public-read',
         Body: part,
         ContentLength: part.byteCount,
         }, function(err, data) {
         if (err) throw err;
         console.log("done", data);
         res.end("OK");
         console.log("https://s3.amazonaws.com/" + bucket + '/' + destPath);
         });*/
    });
    form.parse(req);
    //res.end("OK");

    /*
     var file = req.files.file;
     console.log(file.name);
     console.log(file.type);
     console.log(file.path);

     res.send('respond with a resource');
     */
});

module.exports = router;

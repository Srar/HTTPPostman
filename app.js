var express       = require('express');
var path          = require('path');
var logger        = require('morgan');
var bodyParser    = require('body-parser');
var nodemailer    = require('nodemailer');
var fs            = require('fs');
var app           = express();

var HTTP_PORT = 1000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', (req, res) => {
    var server = req.body.server || '';
    var port   = parseInt(req.body.port || 25);
    var secure = req.body.secure || '';
        secure = secure == 'true';

    var email   = req.body.email || '';
    var title   = req.body.title || '';
    var content = req.body.content || '';
    var from    = req.body.from || '';

    if(server == '' || isNaN(port)) {
        return res.json({
            result: false,
            message: 'incorrect email server or port.'
        });
    }

    if(email == '') {
        return res.json({
            result: false,
            message: 'incorrect email.'
        });
    }

    var transporter = nodemailer.createTransport({
        host: server,
        secureConnection: secure,
        port: port,
        auth: {
            user: req.body.username || '',
            pass: req.body.password || ''
        }
    });
    
    var mailOptions = {
        from: from == '' ? req.body.username : `${from} <${req.body.username}>`,
        to: email,
        subject: title,
        html: content
    };

    transporter.sendMail(mailOptions, (error, info) => {
        var result = null;
        if(error) {
            result = {
                result: false,
                message: error.toString()
            }
        } else {
            result = {
                result: true,
                message: 'send email success.'
            }
        }
        res.json(result);
    });
});

app.use((err, req, res) => {
    console.error(err);
    res.status(503).send('503 Server Error.');
});

process.on('uncaughtException', (err) =>  {
    console.error(err);
});

app.listen(HTTP_PORT, (error) => {
    if(error) return console.error('Listening error:', error);
    console.log('Listening port:' + HTTP_PORT);
});

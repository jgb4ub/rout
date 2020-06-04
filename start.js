var express = require('express');
var path = require('path');
var app = new express();
var PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.listen(PORT, () => console.log(`Connection open on ${ PORT }. Connect at http://localhost:8080/`));

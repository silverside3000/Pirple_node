var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

var server = http.createServer((req, res) =>{
    var parsedURL = url.parse(req.url, true);
    var path =  parsedURL.pathname;
    var trimmedURL = path.replace(/^\/+|\/+$/g, ''); //getting the trimmed UUL

    var queryStringObject = parsedURL.query;// for passed parameters

    var method = req.method.toLowerCase();// get method type

    var headers = req.headers;

    var buffer = "";
    var decoder = new StringDecoder('utf-8');

    req.on('data', (data) =>{
        buffer += decoder.write(data);
    });

    req.on('end', () =>{
        buffer += decoder.end();

        var chooseHandler = typeof(router[trimmedURL]) !== 'undefined' ? router[trimmedURL] : handlers.notFound;

        var data = {
            'trimmedpath':  trimmedURL,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        console.log("the chosen handler is therefore: ", chooseHandler);

        chooseHandler(data, (statusCode,  payload) => {
            statusCode  = typeof(statusCode) == 'number' ? statusCode : 200;

            payload =  typeof(payload) == 'object' ? payload : {};

            payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Returning reponses: ', statusCode, payloadString);
        });

        //console.log("Url = " + trimmedURL + "\nQuery string " , queryString, "\nMethod: "+ method + "\nHeaders + ", headers, "\nbuffer ", buffer); 
        
        
    })
    
});

server.listen(3000, () => {
    console.log("Listening at port 3000");
});

var router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'logout' : handlers.logout,
    'menu': handlers.menu,
    'cart': handlers.cart,
    'orders': handlers.orders
};

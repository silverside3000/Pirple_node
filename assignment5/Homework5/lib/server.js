
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./handlers');
var helpers = require('./helpers');

var server = {};


server.httpserver = http.createServer((req, res) => {
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

        var chooseHandler = typeof(server.router[trimmedURL]) !== 'undefined' ? server.router[trimmedURL] : handlers.notFound;

        // If the request is within the public directory use to the public handler instead
        chooseHandler = trimmedURL.indexOf('assets/') > -1 ? handlers.asset : chooseHandler;

        var data = {
            'trimmedpath':  trimmedURL,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        //console.log("the chosen handler for ", trimmedURL, ' is ', router[trimmedURL]);

        chooseHandler(data, (statusCode,  payload,contentType) => {
            
                // Determine the type of response (fallback to JSON)
                contentType = typeof(contentType) == 'string' ? contentType : 'json';

                            
                // Use the status code returned from the handler, or set the default status code to 200
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
                // Return the response parts that are content-type specific
                var payloadString = '';
                if(contentType == 'json'){
                    res.setHeader('Content-Type', 'application/json');
                    payload = typeof(payload) == 'object'? payload : {};
                    payloadString = JSON.stringify(payload);
                }
            
                if(contentType == 'html'){
                    res.setHeader('Content-Type', 'text/html');
                    payloadString = typeof(payload) == 'string'? payload : '';
                }

                if(contentType == 'js'){ //for javascript
                    res.setHeader('Content-Type', 'text/javascript');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }

                if(contentType == 'favicon'){
                    res.setHeader('Content-Type', 'image/x-icon');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
         
                if(contentType == 'plain'){
                    res.setHeader('Content-Type', 'text/plain');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
         
                  if(contentType == 'css'){
                    res.setHeader('Content-Type', 'text/css');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'png'){
                    res.setHeader('Content-Type', 'image/png');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'jpg'){
                    res.setHeader('Content-Type', 'image/jpeg');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
                    
                // Return the response-parts common to all content-types
                res.writeHead(statusCode);
                res.end(payloadString);
            
            });

        //console.log("Url = " + trimmedURL + "\nQuery string " , queryString, "\nMethod: "+ method + "\nHeaders + ", headers, "\nbuffer ", buffer); 
        
        
    })
    
});

 server.router = {
    '': handlers.index,
    'account/menuitem': handlers.menuitem,
    'account/dashboard': handlers.dashboard,
    'account/cart': handlers.uicart,
    'cart/fill': handlers.fillCart,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/validtoken' : handlers.validtokens,
    'api/logout' : handlers.logout,
    'api/menu': handlers.menu,
    'api/cart': handlers.cart,
    'api/orders': handlers.orders,
    'assets' : handlers.asset
};

server.init = () => {
    server.httpserver.listen(3000, () => {
        console.log("Listening at port 3000");
    });
}

module.exports = server;
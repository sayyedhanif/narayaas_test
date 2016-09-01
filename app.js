
/**
 * Module dependencies.
 */

var express = require('express')
, request = require('request')
, async = require('async')
, http = require('http');

// 
var app = express();

// all environments
app.set('port', process.env.PORT || 3030);
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.methodOverride()); 
app.use(express.cookieParser() );
app.use(express.session({ secret: 'some secret' }));
app.use(app.router);

app.use(function(req, res) {
    return res.status(404).json('404 Not found!');
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log('Error : ' + err);
  return res.json({error: err});
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/characters', function(req, resp){
	console.log("express server people api"+ req.query)
	console.log(req.query.sort)
	var i=1, respDATA = [];
	var getResult = function(){
		console.log("i-------------------1 :"+i)
		request({
	        method :'GET', 
	        url : 'http://swapi.co/api/people',
	        qs : {
	        	"page": i
	        }
	    },
	    function(err,res,body){
	    	console.log("i-------------------2 :"+i)
	    	console.log(err, res.statusCode)
	        if(err){
	            throw(err)
	        }
	        if(res.statusCode >= 200 && res.statusCode < 400) {
	            if(typeof(body) == 'string'){
	                body = JSON.parse(body);
	            }
	            respDATA = respDATA.concat(body.results)
	            console.log("i-------------------3 :"+ respDATA.length)
	            if (++i <=5 && body.count > i*10){
	            	process.nextTick(function() { getResult();})
	            }else{
	            	// sort by height or mass
	            	if (req.query.sort == 'height' || req.query.sort == 'mass'){
	            		respDATA = respDATA.sort(function(a, b) {
						    return parseFloat(a[req.query.sort]) - parseFloat(b[req.query.sort]);
						});
	            	}
	            	// sort by name
	            	if (req.query.sort == 'name'){
	            		respDATA = respDATA.sort(function(a,b) {
						    if ( a.name < b.name )
						        return -1;
						    if ( a.name > b.name )
						        return 1;
						    return 0;
						});
	            	}
	            	
	            	return resp.json(respDATA)
	            }
	        }
	    })
	    
	}

	// calling getResult90 for firs time
	getResult();
});

http.createServer(app).listen(app.get('port'), function(){
console.log('Express server listening on port ' + app.get('port'));
});

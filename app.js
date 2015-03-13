/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express')
  , http = require('http'),
 https = require('https'),
  fs= require('fs');
var url = require('url');



// setup middleware
var app = express();
app.use(express.errorHandler());
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(app.router);
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views






// TODO: Get application information and use it in your app.
// defaults for dev outside bluemix
var service_url = 'https://gateway.watsonplatform.net/question-and-answer-beta/api';
var service_username = 'ecd6de48-e98b-4377-81f2-fa7fe2eb45d4';
var service_password = 'BZBqLvSoMibh';

// render index page
app.get('/', function(req, res){
	res.render('index');
});

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
//app.listen(port, host);


console.dir(host+port);

var auth = "Basic " + new Buffer(service_username + ":" + service_password).toString("base64");

var server=http.createServer(function(req,res){
	fs.readFile('./index.html',function(error,data){
		
		res.writeHead(200,{'Content-Type':'text/html'});
		res.end(data,'utf-8');
	});
}).listen(port,host);


console.log('Server running');
console.log('App started on port ' + port);
var io=require('socket.io').listen(server);
//function healthcare

function healthcare (data,req,next){
	var parts = url.parse(service_url +'/v1/question/healthcare');
	  var options = {
	    host: parts.hostname,
	    port: parts.port,
	    path: parts.pathname,
	    method: 'POST',
	    headers: {
	      'Content-Type'  :'application/json',
	      'Accept':'application/json',
	      'X-synctimeout' : '30',
	      'Authorization' :  auth
	    }
	  };

	  // Create a request to POST to Watson
	  var watson_req = https.request(options, function(result) {
	    result.setEncoding('utf-8');
	    var response_string = '';

	    result.on('data', function(chunk) {
	      response_string += chunk;
	    });

	    result.on('end', function(chunk) {
	    	var answers = JSON.parse(response_string);
	    	
		   var   results = answers[0].question.answers[0];
		   //console.log(answers);
		   console.log("Health"+ results);	    
		   data.healthcare=results; 
		   next();
		   
	      //socket.emit('push message',{'results':results,'nick':data.nick,'qn':data.text});
	    });
	  });

	  watson_req.on('error', function(e) {
	    return res.render('index', {'error': e.message});
	  });

	  // create the question to Watson
	  var questionData = {
	    'question': {
	      'evidenceRequest': {
	        'items': 1 // the number of answers
	      },
	      'questionText': data.text // the question
	    }
	  };
	  
	  var question = {"question":{
	      "questionText":data.text,
	      "formattedAnswer":true
	      }};

console.log(question);
	  // Set the POST body and send to Watson
	 // watson_req.write(JSON.stringify(questionData));
	  watson_req.write(JSON.stringify(question));
	  watson_req.end();
	 

}//eof fn
//eof function health care


io.sockets.on('connection',function(socket){
	socket.on('message',
			function(data,req,res){
		
		var parts = url.parse(service_url +'/v1/question/travel');
		  var options = {
		    host: parts.hostname,
		    port: parts.port,
		    path: parts.pathname,
		    method: 'POST',
		    headers: {
		      'Content-Type'  :'application/json',
		      'Accept':'application/json',
		      'X-synctimeout' : '30',
		      'Authorization' :  auth
		    }
		  };

		  // Create a request to POST to Watson
		  var watson_req = https.request(options, function(result) {
		    result.setEncoding('utf-8');
		    var response_string = '';

		    result.on('data', function(chunk) {
		      response_string += chunk;
		    });

		    result.on('end', function(chunk) {
		    	var answers = JSON.parse(response_string);
		    	
			   var   results = answers[0].question.answers[0];
			 // console.log('travel'+answers);
			  console.log('travel'+ results);
			  console.log('travel'+ results.text);
			  data.results=results;
			  var conf='';
			  if(!data.results_1){conf=0;}
			  else{conf=data.results_1.confidence;}
			  if( data.results.confidence > conf)
				 {resul=data.results;}
				  else {resul=data.results_1;}
			    
				 socket.emit('push message',{'results':resul,'nick':data.nick,'qn':data.text});
			 
			  
			  
			   
		    });
		  });

		  watson_req.on('error', function(e) {
		    return res.render('index', {'error': e.message});
		  });
		  
		  //for health
			var parts_1 = url.parse(service_url +'/v1/question/healthcare');
			  var options_1 = {
			    host: parts_1.hostname,
			    port: parts_1.port,
			    path: parts_1.pathname,
			    method: 'POST',
			    headers: {
			      'Content-Type'  :'application/json',
			      'Accept':'application/json',
			      'X-synctimeout' : '30',
			      'Authorization' :  auth
			    }
			  };

			  // Create a request to POST to Watson
			  var watson_req_1 = https.request(options_1, function(result) {
			    result.setEncoding('utf-8');
			    var response_string_1 = '';

			    result.on('data', function(chunk) {
			      response_string_1 += chunk;
			    });

			    result.on('end', function(chunk) {
			    	var answers_1 = JSON.parse(response_string_1);
			    	
				   var   results_1 = answers_1[0].question.answers[0];
				   //console.log(answers);
				   console.log("Health"+ results_1.confidence);	
				   console.log('Health'+ results_1.formattedText);
				  data.results_1=results_1;
				  
				 
				   
			      //socket.emit('push message',{'results':results,'nick':data.nick,'qn':data.text});
			    });
			  });

			  watson_req.on('error', function(e) {
			    return res.render('index', {'error': e.message});
			  });
		  
		  //eof ofr health

		  // create the question to Watson
		  var questionData = {
		    'question': {
		      'evidenceRequest': {
		        'items': 1 // the number of answers
		      },
		      'questionText': data.text // the question
		    }
		  };
		  
		  var question = {"question":{
		      "questionText":data.text,
		      "formattedAnswer":true
		      }};

   
		  // Set the POST body and send to Watson
		 // watson_req.write(JSON.stringify(questionData));
		  watson_req.write(JSON.stringify(question));
		  watson_req.end();
		  watson_req_1.write(JSON.stringify(question));
		  watson_req_1.end();
		 
		      //watson do his task
		    
		      });
});



app.all('*', function(req, res){
	
	res.send( "404:Page not found. Click on the logo for home page." );
			        }); 


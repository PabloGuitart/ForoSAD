var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dm = require('./dm_remote.js');
var zmq = require('zmq');
var UrlSub= process.argv[4];
var host = process.argv[2];
var port = process.argv[3];
var httpPort = process.argv[5];
var sub = zmq.socket('sub');
var viewsdir = __dirname + '/views';
var who = 'webserver';
var sockRef;

//Para iniciar: node forum.js 127.0.0.1 9000 127.0.0.1:9001 10000
//nodo1: nodemon forum.js 127.0.0.1 9000 127.0.0.1:9002 10000
//nodo2: nodemon forum.js 127.0.0.1 9001 127.0.0.1:9003 10001
//nodo3: nodemon forum.js 127.0.0.1 9005 127.0.0.1:9004 10002
app.set('views', viewsdir)


// called on connection
function get_page (req, res) {
	console.log ("Serving request " + req.params.page);
	res.sendFile(viewsdir + '/' + req.params.page);
}

// Called on server startup
function on_startup () {
	console.log("Starting: server current directory:" + __dirname);
	sub.connect('tcp://'+UrlSub);
	//sub.connect('tcp://'+host+':*');
	sub.subscribe("webserver");
	console.log('Subscribed to: '+UrlSub);
	dm.Start(host,port);
	
}

// serve static css as is
app.use('/css', express.static(__dirname + '/css'));

// serve static html files
app.get('/', function(req, res){
	req.params.page = 'index.html';
	get_page (req, res);
});

app.get('/:page', function(req, res){
	get_page (req, res);
});

//EVENTO QUE SE EJECUTA CUANDO VIENE UNA PETICION DEL PUB
sub.on('message',function(type,invo){
	
	console.log("Event from pub: message: " + invo);
	var msg = JSON.parse (invo);
	
	switch(msg.what)
	{
		case 'add public message':
			io.emit('message', JSON.stringify(msg.obj));
			break;
		 case 'add subject':
		 	console.log("Event: new subject: " + msg.s + '-->' + msg.id);
    	 	if (msg.id == -1) {
    	 		io.emit ('new subject', 'err', 'El tema ya existe', msg.s);
    	 	} else {
    	 		io.emit ('new subject', 'ack', msg.id, msg.s);
    	 		io.emit ('new subject', 'add', msg.id, msg.s);
    	 	}      
		 	break;
	}

	
});

io.on('connection', function(sock) {
	console.log("Event: client connected");
	sockRef = sock;
	sock.on('disconnect', function(){
		console.log('Event: client disconnected');
	});

  	// on messages that come from client, store them, and send them to every 
  	// connected client
  	// TODO: We better optimize message delivery using rooms.
  	sock.on('message', function(msgStr){
  		console.log("Event: message: " + msgStr);
  		var msg = JSON.parse (msgStr);
		msg.ts = new Date(); // timestamp
		if (msg.isPrivate) {
			dm.addPrivateMessage (msg,who, function () {
				//console.log(msg);
				io.emit('message', JSON.stringify(msg));
			});
		} else {
			dm.addPublicMessage (msg,who, function () {
				io.emit('message', JSON.stringify(msg));
			});
		}
	});

    // New subject added to storage, and broadcasted
    sock.on('new subject', function (sbj) {
    	dm.addSubject(sbj, function (id) {
    		console.log("Event: new subject: " + sbj + '-->' + id);
    		if (id == -1) {
    			sock.emit ('new subject', 'err', 'El tema ya existe', sbj);
    		} else {
    			sock.emit ('new subject', 'ack', id, sbj);
    			io.emit ('new subject', 'add', id, sbj);
    		}      
    	});
    });

    // New subject added to storage, and broadcasted
    sock.on('new user', function (usr, pas) {
    	dm.addUser(usr, pas, function (exists) {
    		console.log("Event: new user: " + usr + '(' + pas + ')');
    		if (exists) {
    			sock.emit ('new user', 'err', usr, 'El usuario ya existe');
    		} else {
    			sock.emit ('new user', 'ack', usr);
    			io.emit ('new user', 'add', usr);      
    		}
    	});
    });

  	// Client ask for current user list
  	sock.on ('get user list', function () {
  		dm.getUserList (function (listUser) {
	  		console.log("Event: get user list");  		
  			sock.emit ('user list', listUser);
  		});
  	});

   	// Client ask for current subject list
   	sock.on ('get subject list', function () {
   		dm.getSubjectList (function (listSubject) {
	   		console.log("Event: get subject list");  		
   			sock.emit ('subject list', listSubject);
   		});
   	});

   	// Client ask for message list
   	sock.on ('get message list', function (from, to, isPriv) {
  		console.log("Event: get message list: " + from + ':' + to + '(' + isPriv + ')');  		
  		if (isPriv) {
  			dm.getPrivateMessageList (from, to, function (listMessage) {
  				sock.emit ('message list', from, to, isPriv, listMessage);
  			});
  		} else {
  			dm.getPublicMessageList (to, function (listMessage) {
	  			sock.emit ('message list', from, to, isPriv, listMessage);
	  		});
  		}
  	});

  	// Client authenticates
  	// TODO: session management and possible single sign on
  	sock.on ('login', function (u,p) {
  		console.log("Event: user logs in");  		
  		dm.login (u, p, function (ok) {
  			if (!ok) {
  				console.log ("Wrong user credentials: " + u + '(' + p + ')');
  				sock.emit ('login', 'err', 'Credenciales incorrectas');
  			} else {
  				console.log ("User logs in: " + u + '(' + p + ')');
  				sock.emit ('login', 'ack', u);	  			
  			}
  		});
  	});
});



// Listen for connections !!
http.listen (httpPort, on_startup);

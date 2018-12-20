var net = require('net');
var zmq = require('zmq');
var client = zmq.socket('req');

exports.Start = function (host, port) {

	 client.connect('tcp://'+host+':'+port);
	// client.connect(port, host, function() {
    	console.log('Connected to: ' + host + ':' + port);
    // 	if (cb != null) cb();
	// });
}

// exports.CloseConnection = function()
// {
// 	client.end();
// }


var callbacks = {} // hash of callbacks. Key is invoId
var invoCounter = 0; // current invocation number is key to access "callbacks".

//
// When data comes from server. It is a reply from our previous request
// extract the reply, find the callback, and call it.
// Its useful to study "exports" functions before studying this one.
//
client.on ('message', function (data) {
	//var nstr = data.toString().replace("}{","},{");
	console.log ('data comes in: ' + data);
	var reply = JSON.parse (data);
	switch (reply.what) {
		// TODO complete list of commands
		case 'add user':
			console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
			callbacks[reply.invoId] (reply.obj);
			delete callbacks [reply.invoId];
			break;
		case 'add subject':
			console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
			callbacks[reply.invoId] (reply.obj);
			delete callbacks [reply.invoId];
			break;
		case 'get user list':
			console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
			callbacks[reply.invoId] (reply.obj);
			delete callbacks [reply.invoId];
			break;
		case 'get subject list':
			console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
			callbacks [reply.invoId] (reply.obj); // call the stored callback, one argument
			delete callbacks [reply.invoId]; // remove from hash
			break;
		case 'login':
			console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
			callbacks[reply.invoId] (reply.obj);
			delete callbacks [reply.invoId];
			break;
		case 'add private message':
			console.log ('We received a reply for: ' + reply.what + ':' + reply.invoId);
			callbacks[reply.invoId] (reply.obj);
			delete callbacks [reply.invoId];
			break;
		case 'add public message':
			console.log ('We received a reply for add command');
			callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
			delete callbacks [reply.invoId]; // remove from hash
			break;
		case 'get public message list':
			console.log ('We received a reply for add command');
			callbacks [reply.invoId] (reply.obj); // call the stored callback, no arguments
			delete callbacks [reply.invoId]; // remove from hash
			break;
		default:
			console.log ("Panic: we got this: " + reply.what);
	}
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});


//
// on each invocation we store the command to execute (what) and the invocation Id (invoId)
// InvoId is used to execute the proper callback when reply comes back.
//
function Invo (str, cb) {
	this.what = str;
	this.invoId = ++invoCounter;
	callbacks[invoCounter] = cb;
}

//
//
// Exported functions as 'dm'
//
//

exports.addUser = function (u,p,cb)
{
	var invo = new Invo('add user',cb);
	invo.u = u;
	invo.p = p;
	client.send(JSON.stringify(invo));
}

exports.addSubject = function(s,who, cb)
{
	var invo = new Invo('add subject',cb);
	invo.s = s;
	invo.who = who;
	client.send(JSON.stringify(invo));
}

exports.getPublicMessageList = function  (sbj, cb) {
	var invo = new Invo ('get public message list', cb);	
	invo.sbj = sbj;
	client.send(JSON.stringify(invo));
}

exports.getPrivateMessageList = function (u1, u2, cb) {
	invo = new Invo ('get private message list', cb);
	invo.u1 = u1;
	invo.u2 = u2;
	client.send(JSON.stringify(invo));
}

exports.getSubjectList = function (cb) {
	client.send(JSON.stringify(new Invo ('get subject list', cb)));
}

exports.getUserList = function(cb)
{
	var invo = new Invo('get user list',cb);
	client.send(JSON.stringify(invo));
}

exports.login = function(user,passw,cb)
{
	var invo = new Invo('login',cb);
	invo.user = user;
	invo.passw = passw;
	client.send(JSON.stringify(invo));
}
exports.addPrivateMessage = function(msg,cb)
{
	var invo = new Invo('add private message',cb);
	invo.msg = msg;
	client.send(JSON.stringify(invo));
}

exports.addPublicMessage = function(msg,who,cb)
{
	var invo = new Invo('add public message',cb);
	invo.obj =  msg;
	invo.who = who; //Esta variable se utiliza para determinar de donde procede la peticion en el websocket
	client.send(JSON.stringify(invo));
}

exports.getPublicMessageList = function(sbj,cb)
{
	var invo = new Invo('get public message list',cb);
	invo.obj =  sbj;
	client.send(JSON.stringify(invo));
}

// TODO: complete the rest of the forum functions.




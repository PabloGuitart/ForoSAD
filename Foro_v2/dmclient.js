var dm = require ('./dm_remote.js');

var HOST = process.argv[2];//'127.0.0.1';
var PORT = process.argv[3];//9000;

var opc = process.argv[4];
var username = process.argv[5];
var passw = process.argv[6];

var subject = process.argv[5];

var message = process.argv[5];

//var msg = process.argv[5];
var user = process.argv[6];
var to = process.argv[7];
var isPrivate = false;
var who = 'dmclient';
function Message (msg, from, to, ts,isPrivate) {
    this.msg=msg; this.from=from; this.to=to; this.ts = ts; this.isPrivate = isPrivate;
}
		// Write the command to the server 
		dm.Start('127.0.0.1','9000');		
	switch(opc)
	{
		case 'add user':
			dm.addUser(username,passw,function(ml){
				console.log("here it is:");
				console.log(JSON.stringify(ml));
			});
			dm.CloseConnection();
			break;

		case 'add subject':
			dm.addSubject(subject,who,function(ml){
				console.log("here it is:");
				console.log(JSON.stringify(ml))
			});
			//dm.CloseConnection();
			break;
		case 'get subject list':
			dm.getSubjectList (function (ml) {
				console.log ("here it is:")
				console.log (JSON.stringify(ml));
			});
			dm.CloseConnection();
			break;
		case 'get user list':
			dm.getUserList (function (ml) {
				console.log ("here it is:")
				console.log (JSON.stringify(ml));
			});
			dm.CloseConnection();
			break;	
		case 'login':
			dm.login(user,passw,function (ml) {
				console.log ("here it is:")
				console.log (JSON.stringify(ml));
			});
			dm.CloseConnection();
			break;		
		case 'add private message':
		//no se esta utilizando
			dm.CloseConnection();
			break;		
		case 'add public message':
		//node dmclient.js 127.0.0.1 9000 'add public message' 'mensaje desde dmclient2' 'Foreador' 'id0'
		//agrega post por temas
		var msg = new Message (message, user, to, new Date(),isPrivate);
			dm.addPublicMessage(msg,who,function (ml) {
				console.log ("here it is:")
				console.log (JSON.stringify(ml));
			});
			//dm.CloseConnection();
			break;	
		case 'get public message list':
			dm.getPublicMessageList(subject,function (ml) {
				console.log ("here it is:")
				console.log (JSON.stringify(ml));
			});
			dm.CloseConnection();
			break;		
	}
   	

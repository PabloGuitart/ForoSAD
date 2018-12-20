var net = require('net');
var zmq = require('zmq');
var dm = require ('./dm.js');
var HOST = process.argv[2];//'127.0.0.1';
var PORT = process.argv[3];//9000;
var PortPub =process.argv[4];
var otherServer = process.argv[5];
var pub = zmq.socket('pub');

var sub = zmq.socket('sub');
var isToServer = false;
var serverUrl=[];
sub.subscribe("checkpoint");

//Para iniciar: 
//nodo1: nodemon dmserver.js 127.0.0.1 9000 9002 'tcp://127.0.0.1:9003,tcp://127.0.0.1:9004'
//nodo2: nodemon dmserver.js 127.0.0.1 9001 9003 'tcp://127.0.0.1:9002,tcp://127.0.0.1:9004'
//nodo3: nodemon dmserver.js 127.0.0.1 9005 9004 'tcp://127.0.0.1:9003,tcp://127.0.0.1:9002'
//var url = 'tcp://*:' + PortPub;
//console.log(otherServer);
pub.bind('tcp://*:' + PortPub);

//SEGMENTO DE CODIGO QUE SEPARA LOS SERVER QUE SE ENVIAN COMO PARAMETRO
if(otherServer)
{

    serverUrl = otherServer.split(",");
    for(i=0; i<serverUrl.length;i++)
    {
        serverUrl[i] = serverUrl[i].trim();
        sub.connect(serverUrl[i]);
    }
    isToServer=true;
}

// Create the server socket, on client connections, bind event handlers

var sock = zmq.socket('rep');
sock.bind('tcp://'+HOST+':'+PORT,function(err){
    if(err) 
        throw err;
    else
    {
        console.log('Reply to: '+'tcp://'+HOST+':'+PORT);
        console.log('Publish to port:'+PortPub);
    }
        
});    
    // We have a connection - a socket object is assigned to the connection automatically
    
    
    // Add a 'data' event handler to this instance of socket
    sock.on('message', function(data) {
        
        console.log('request comes in...' + data);
        var str = data.toString();
        var invo = JSON.parse (str);
        var request = invo.who;
        console.log('request is:' + invo.what + ':' + str);

        var reply = {what:invo.what, invoId:invo.invoId};
        switch (invo.what) {
            case 'add user':
                reply.obj = dm.addUser(invo.u,invo.p);
                break;
            case 'add subject':
                reply.obj = dm.addSubject(invo.s);
                if(request === 'dmclient')
                {
                    console.log(invo.obj);
                    pub.send(['webserver',JSON.stringify(invo)]);
                }
                if (!reply.obj == -1) 
                {
                    if(isToServer)
                    {
                        pub.send(['checkpoint',data]);
                    }
                }  
                break;
        	case 'get subject list': 
                reply.obj = dm.getSubjectList();
                break;
            case 'get user list':
                reply.obj = dm.getUserList();
                break;
            case 'login':
                reply.obj = dm.login(invo.user,invo.passw);
                break;
            case 'add private message':
            //no se esta implementando
                reply.obj = dm.addPrivateMessage(invo.msg);
                break;
            case 'get private message list': 
            //no se esta implementando
            	reply.obj = dm.getPrivateMessageList (cmd.u1, cmd.u2);
                break;
            case 'add public message': 
                reply.obj = dm.addPublicMessage(invo.obj);
                if(request === 'dmclient')
                {
                    console.log(invo.obj);
                    pub.send(['webserver',JSON.stringify(invo)]);
                }
                if(isToServer)
                {
                    pub.send(['checkpoint',data]);
                }
                break;
            case 'get public message list': 
            	reply.obj = dm.getPublicMessageList(invo.obj);
                break;
           
            // TODO: complete all forum functions
        }

        //PROPAGA LA INFORMACION A LOS DEMAS SERVER 
        // if(isToServer)
        // {
        //     pub.send(['checkpoint',data]);
        // }
        //ENVIA LOS DATOS POR REP
        sock.send(JSON.stringify(reply));

        //VERIFICA SI LA PETICION VIENE DESDE EL DMCLIENT, SI ES ASI, ENVIA POR PUB LOS DATOS PARA MOSTRAR
        
        
    });


    //EVENTO QUE SE EJECUTA CUANDO SE ENVIAN DATOS DE OTRO SERVER
    sub.on('message',function(type,data){
        console.log('request comes in...' + data);
        var str = data.toString();
        var invo = JSON.parse (str);
        console.log('request is:' + invo.what + ':' + str);

        var reply = {what:invo.what, invoId:invo.invoId};
        switch (invo.what) {
            case 'add user':
                reply.obj = dm.addUser(invo.u,invo.p);
                break;
            case 'add subject':
                reply.obj = dm.addSubject(invo.s);
                pub.send(['webserver',JSON.stringify(invo)]);
                break;
            case 'add private message':
            //no se esta implementando 
                reply.obj = dm.addPrivateMessage(invo.msg);
                break;
            case 'add public message': 
                reply.obj = dm.addPublicMessage(invo.obj);
                pub.send(['webserver',JSON.stringify(invo)]);
                //console.log('Sending to subscriber: '+JSON.stringify(invo.obj));
                break;
        }
    } );
   
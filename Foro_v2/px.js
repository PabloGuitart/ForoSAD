const net = require('net');

var args = parseArguments();

const serverSocket = net.createServer ( clientSocket => {

    const peerSocket = new net.Socket();

    peerSocket.connect (args.remotePort, args.remoteIp, () => {
        console.log ("Connected to peer '" + args.remoteIp + ":" + args.remotePort) + "'";


        peerSocket.on('data', msg =>  {
            console.log ("From remote peer to client --> ");
            console.log (msg);
            console.log ("" + msg);
            clientSocket.write (msg);
        });

        clientSocket.on('data', msg =>  {
            console.log ("From client to remote peer --> ");
            console.log (msg);
            console.log ("" + msg);
            peerSocket.write (msg);
        });

        //clientSocket.pipe (peerSocket);
        //peerSocket.pipe (clientSocket);

        clientSocket.on ('end', () => {
            console.log ("Client disconnected. We disconnect peer.")
            peerSocket.end();
        });

        peerSocket.on ('end', () => {
            console.log ("Peer disconnected. We disconnect client.")
            clientSocket.end();
        });

        clientSocket.on ('error' , x => {
            console.log ("error on client socket. We disconnect peer --> " + x);
            peerSocket.end();
        });

    });

    peerSocket.on ('error' , x => {
        console.log ("error on peer socket. We disconnect client --> " + x);
        clientSocket.end();
    });



});

serverSocket.on ('error', x => {
    console.log ("Error occurred on server socket --> " + x);
    process.exit (1);
})

serverSocket.listen (args.localPort, args.localIp);
console.log("TCP server accepting connection on port: " + args.localPort);


function parseArguments () {
    if (process.argv.length != 4) usage("need 2 arguments");

    var ret = new Object();

    ret.localIp = "127.0.0.1";
    ret.localPort = parseInt (process.argv[2]);
    parts = process.argv[3].split (":");
    ret.remoteIp = parts[0];
    ret.remotePort = parseInt (parts[1]);

    if (isNaN(ret.localPort)) usage ("localPort '" + process.argv[2] + "' is not a number");
    if (isNaN(ret.remotePort)) usage ("remotePort '" + parts[1] + "' is not a number");

    console.log ("Proxy " + ret.localPort + " --> " + ret.remoteIp + ":" + ret.remotePort);
    return ret;
}

function usage (msg) {
    console.log ("Usage error: " + msg);
    console.log ("\tnode " + process.argv[1] + " localport + remote_ip:remote_port");
    process.exit();
}

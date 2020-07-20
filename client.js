const net = require("net");
// Create a socket and init a client 
function  initClient(port) {
    return new Promise((resolve,reject)=>{
        let client = new net.Socket();
        
        client.connect(port, 'localhost', function() {
            resolve(client);
        });
        client.on('error',(error)=>{
            reject(error)
        });  
    })
}

// Close client connection
function closeClientConnection(clientSocket) {
    return new Promise((resolve,reject)=>{
        let end = clientSocket.destroy();
        clientSocket.on('close',()=>{
            resolve(end);
        });
        clientSocket.on('error',(error)=>{
            reject(error);
        });
    });  
}

// Send Data to the server from client socket
function sendData(clientSocket,request){
    return new Promise((resolve,reject)=>{
        let empty=false;
        empty = clientSocket.write(request, function () {
            resolve(empty);
        });
        clientSocket.on('error',(error)=>{
            reject(error);
        });
    })
}
// Receive Data from the server 
function receiveData(clientSocket) {
    return new Promise((resolve,reject)=>{
        clientSocket.on('data',function (data) {
            resolve(data.toString());
        })
        clientSocket.on('error',(error)=>{
            reject(error);
        });
    });  
}
async function sendRequest(clientSocket,request) {
    return new Promise(async (resolve,reject)=>{
        await  sendData(clientSocket,request);
        let data = await receiveData(clientSocket);
        resolve(data)

    })
}
module.exports={
    init:initClient,
    send:sendRequest,
    close:closeClientConnection
}















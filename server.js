const net = require("net");
const memcached = require('./memcached');
const port = 8007;

const Request = require('./Request');
// Storage commands
const storage_commands=["append","set","replace","add","prepend","cas"];
// Get commands 
const get_commands = ["get","gets"];

let clients={};
let cas_unique=0;
const server = net.createServer(function (socket) {

    console.log(socket.remoteAddress);
    
    console.log(socket.remotePort);
    let id_client =socket.remoteAddress+" : "+socket.remotePort.toString()
    clients[id_client] = {
        "address":socket.remoteAddress,
        "port":socket.remotePort
    }
    socket.on('error',(error)=>{
        console.log("ERROR");
        
        console.error(error);
    })
    
    socket.on("data",async (data)=> {
        let msg = data.toString();        
        id_client =socket.remoteAddress+" : "+socket.remotePort.toString()
        let commands = msg.split("\r\n").filter((element) => element.length>0);
        console.log("COMMANDS");
        console.log(commands);
        
        
        for (let i = 0; i < commands.length; i++) {
            const element = commands[i];
            console.log(element);
            msg=element
            let cmd = msg.split(" ").filter((element) => element.length>0);
            console.log(cmd);
            let request;
             if(clients[id_client].request){
                request = clients[id_client].request;
                
                if(msg.length === request.bytes){
                    request.setValue(msg);
                    console.log(request);
                    switch (request.command) {
                        case "add":
                            await memcached.add(request)
                                .then(response=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("STORED\r\n");
                                    }
                                })
                                .catch(err=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("NOT_STORED\r\n")
                                    }
                                });
                            break;
                        case "replace":
                            await memcached.replace(request)
                                .then(response=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("STORED\r\n");
                                    }
                                })
                                .catch(err=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("NOT_STORED\r\n")
                                    }
                                });
                            break;
                        case "append":
                            await memcached.append(request)
                                .then(response=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("STORED\r\n");
                                    }
                                })
                                .catch(err=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("NOT_STORED\r\n")
                                    }
                                });
                            break;
                        case "prepend":
                            await memcached.prepend(request)
                                .then(response=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("STORED\r\n");
                                    }
                                })
                                .catch(err=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("NOT_STORED\r\n")
                                    }
                                });
                            break;
                        case "set":
                            await memcached.set(request)
                                .then(response=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("STORED\r\n");
                                    }
                                })
                                .catch(err=>{
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("NOT_STORED\r\n")
                                    }
                                });
                            break;
                        case "cas":
                           
                           await  memcached.cas(request)
                                .then(response=>{
                                    console.log("RESPONSE");
                                    console.log(response);
                                    
                                    if(request.no_reply===1){
                                        socket.write("\r\n");
                                    }else{
                                        socket.write("EXISTS\r\n");
                                    }
                                })
                                .catch(err=>{
                                    if (err.message==='the clients does not match') {                                        
                                        if(request.no_reply===1){
                                            socket.write("\r\n");
                                        }else{
                                            socket.write("ERROR\r\n");
                                        }
                                    } else {
                                        socket.write("NOT_FOUND\r\n");
                                    }
                                });
                        default:
                            break;
                    }
                }else{
                    socket.write("CLIENT_ERROR bad data chunk\r\nERROR\r\n");
                }
                delete clients[id_client].request;
            } 
            // Storage Commands
            else if (storage_commands.indexOf(cmd[0])>=0){
                // The cas command must have a cas value
                if (cmd[0]!='cas') {
                    
                    if(cmd.length===6){
                        request = new Request(cmd[0],cmd[1],cmd[2],parseInt(cmd[3]),parseInt(cmd[4]),cas_unique,1)
                        cas_unique++;
                    }else if (cmd.length===5){
                        request = new Request(cmd[0],cmd[1],cmd[2],parseInt(cmd[3]),parseInt(cmd[4]),cas_unique,0)
                        cas_unique++;
                    }else{
                        socket.write("CLIENT_ERROR bad command syntax\r\nERROR\r\n");
                    }
                    
                }else{
                    if(cmd.length===7){
                        request = new Request(cmd[0],cmd[1],cmd[2],parseInt(cmd[3]),parseInt(cmd[4]),cmd[5],1)
                    }else if (cmd.length===6){
                        request = new Request(cmd[0],cmd[1],cmd[2],parseInt(cmd[3]),parseInt(cmd[4]),cmd[5],0)
                    }else{
                        socket.write("CLIENT_ERROR bad command syntax\r\nERROR\r\n");
                    }
                }
                if(request){
                    // Cas
                    request.setClient(id_client);                    
                    clients[id_client]["request"]=request;
                }
            }
    
            // GET COMMANDS
            else if (get_commands.indexOf(cmd[0])>=0){
                let keys = msg.split(" ").filter((element) => element.length>0);
                keys.shift();
                console.log(keys);                
                if (cmd[0]==="get"){
                    console.log(cmd[0]);
                    
                    await memcached.get(keys)
                        .then(data=>{
                            console.log(data);
                            let response="";
                            for (let i = 0; i < data.length; i++) {
                                const element = data[i];    
                                response+="VALUE "+element.key+" "+element.flags+" "+element.bytes+"\r\n"+element.value+"\r\nEND\r\n";                        
                            }
                            socket.write(response);
                        })
                        .catch(err=>socket.write("\r\n"))
                }else if(cmd[0]==='gets'){
                    await memcached.get(keys)
                    .then(data=>{
                        console.log(data);
                        let response="";
                        for (let i = 0; i < data.length; i++) {
                            const element = data[i];
                            console.log(element);
                            response +="VALUE "+element.key+" "+element.flags+" "+element.bytes+" "+ element.cas_unique+"\r\n"+element.value+"\r\nEND\r\n";
                        }
                        socket.write(response);
                    })
                    .catch(err=>socket.write("\r\n"))
                }
            }else{
                socket.write("ERROR\r\n");
            }
        }

        
    })
    socket.on("close",function () {
        console.log("CONNECTION CLOSE BY address "+socket.remoteAddress + " PORT "+socket.remotePort);
        delete clients[id_client];
    })
})
server.listen(port,()=>{
    console.log("server is listening on port "+port);
    
})
server.setMaxListeners(50);
setInterval(function () {
    memcached.removeExpired(new Date().getTime())
        .then(data=>{
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                console.log("the key "+element+" has been deleted"); 
            }
        })
},1000)



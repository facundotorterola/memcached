const net = require('net');

const Memcached =require('./classes/memcached');
const memcached = new  Memcached(); 
const PORT = 8010;

const Request = require('./classes/request');
// Storage commands
const STORAGE_COMMANDS=['append','set','replace','add','prepend','cas'];
// Get commands 
const GET_COMMANDS = ['get','gets'];

let clients={};
const server = net.createServer( (socket) => {
    const ID_CLIENT = `${socket.remoteAddress} : ${socket.remotePort.toString()}`;
    console.log(`NEW CONNECTION OF CLIENT : ${ID_CLIENT}`);
    clients[ID_CLIENT]={
        'port':socket.remotePort.toString(),
        'address':socket.remoteAddress
    }

    socket.on('data',async (data)=> {
        // Frame received
       
        let frame = data.toString();        
        const COMMANDS = frame.split('\r\n');
        COMMANDS.pop();
        console.log('COMMANDS');
        console.log(COMMANDS);
        for (let i = 0; i < COMMANDS.length; i++) {
            
            let message=COMMANDS[i];
            console.log(message);
            let command = message.split(' ').filter((element) => element.length>0);
            console.log(command);
            let request;
            // Check if the client has a request
            if(clients[ID_CLIENT].request){
                request = clients[ID_CLIENT].request;
                try {
                    request.setValue(message);
                    console.log(request);
                    memcached.requestHandler(request)
                        .then(response=>{
                            if(request.no_reply===1){
                                socket.write('\r\n');
                            }else{
                                socket.write(response);
                            }
                        }).catch(error=>{
                            socket.write(error.message);
                        });
                } catch (error) {
                    socket.write(error.message);
                }
                delete clients[ID_CLIENT].request;
            } 
            // Storage Commands
            else if (STORAGE_COMMANDS.indexOf(command[0])>=0){
                // The cas command must have a cas value
                if (command[0]!=='cas') {
                    
                    if(command.length===6){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),1)
                        } catch (error) {
                            socket.write(error.message);
                        }
                    }else if (command.length===5){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),0)
                        } catch (error) {
                            socket.write(error.message);
                        }
                    }else{
                        socket.write('CLIENT_ERROR header malformed\r\nERROR\r\n');
                    }
                }else{
                    if(command.length===7){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),1,parseInt(command[5]));
                        } catch (error) {
                            console.log(error);
                            socket.write(error.message);
                        }
                    }else if (command.length===6){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),0,parseInt(command[5]));
                        } catch (error) {
                            socket.write(error.message);
                        }
                    }else{
                        socket.write('CLIENT_ERROR header malformed\r\nERROR\r\n');
                    }
                }
                if(request){
                    // Store client request
                    clients[ID_CLIENT]['request']=request;
                }
            }
            // GET COMMANDS
            else if (GET_COMMANDS.indexOf(command[0])>=0){
                let keys = message.split(' ').filter((element) => element.length>0);
                keys.shift();
                if (keys.length===1) {
                    memcached.getKeyValue(keys[0]).then(data=>{
                        if (command[0]==='get') {
                            socket.write(data.stringGetRequest());
                        }else{
                            socket.write(data.stringGetsRequest());
                        }                        
                    }).catch(err=>socket.write('\r\n'))
        
                }else{
                    memcached.getMulKeysValues(keys)
                        .then(data=>{
                            let response='';
                            for (let i = 0; i < data.length; i++) {
                                const element = data[i];
                                if (command[0]==='get') {
                                    response+=element.stringGetRequest();
                                }else{
                                    response+=element.stringGetsRequest();
                                }                               
                            }
                            socket.write(response);
                        })
                        .catch(err=>socket.write('\r\n'))
                }
                
            }else{
                socket.write('ERROR\r\n');
            }
        }
    })
    socket.on('close',function () {
        console.log(`CONNECTION CLOSE BY address ${socket.remoteAddress} PORT ${socket.remotePort}`);
        delete clients[ID_CLIENT];
    });

    socket.on('error',(error)=>{
        console.log('ERROR');
        console.error(error);
    });
    
});
server.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`);
});
server.setMaxListeners(50);


// Control Expired Keys
setInterval( ()=> {
    memcached.removeKeysExpired(new Date().getTime())
        .then(data=>{
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                console.log(`the key ${element} has been deleted`); 
            }
        })
},1000)



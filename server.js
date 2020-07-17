const net = require('net');

// const memcached = require('./memcached');
const Memcached =require('./Memcached');
const memcached = new  Memcached(); 
const PORT = 8010;

const Request = require('./Request');
// Storage commands
const STORAGE_COMMANDS=['append','set','replace','add','prepend','cas'];
// Get commands 
const GET_COMMANDS = ['get','gets'];

let clients={};
let CAS_UNIQUE=0;
const server = net.createServer( (socket) => {

    console.log(socket.remoteAddress);
    
    console.log(socket.remotePort);
    let id_client = `${socket.remoteAddress} : ${socket.remotePort.toString()}`;
    clients[id_client] = {
        'address':socket.remoteAddress,
        'port':socket.remotePort
    }
    socket.on('error',(error)=>{
        console.log('ERROR');
        
        console.error(error);
    })
    
    socket.on('data',async (data)=> {
        let frame = data.toString();        
        const COMMANDS = frame.split('\r\n').filter((element) => element.length>0);
        console.log('COMMANDS');
        console.log(COMMANDS);
        for (let i = 0; i < COMMANDS.length; i++) {
            let message=COMMANDS[i];
            console.log(message);
            let command = message.split(' ').filter((element) => element.length>0);
            console.log(command);
            let request;
            if(clients[id_client].request){
                request = clients[id_client].request;
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
                            if(request.no_reply===1){
                                socket.write('\r\n');
                            }else{
                                socket.write(error);
                            }
                        });
                } catch (error) {
                    socket.write(error.message);
                }
                delete clients[id_client].request;
            } 
            // Storage Commands
            else if (STORAGE_COMMANDS.indexOf(command[0])>=0){
                // The cas command must have a cas value
                if (command[0]!=='cas') {
                    
                    if(command.length===6){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),CAS_UNIQUE,1)
                        } catch (error) {
                            socket.write(error.message);
                        }
                    }else if (command.length===5){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),CAS_UNIQUE,0)
                        } catch (error) {
                            socket.write(error.message);
                        }
                    }else{
                        socket.write('CLIENT_ERROR header bad formed\r\nERROR\r\n');
                    }
                    CAS_UNIQUE++;
                }else{
                    if(command.length===7){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),parseInt(command[5]),1);
                        } catch (error) {
                            console.log(error);
                            socket.write(error.message);
                        }
                    }else if (command.length===6){
                        try {
                            request = new Request(command[0],command[1],parseInt(command[2]),parseInt(command[3]),parseInt(command[4]),parseInt(command[5]),0);
                        } catch (error) {
                            socket.write(error.message);
                        }
                    }else{
                        socket.write('CLIENT_ERROR header bad formed\r\nERROR\r\n');
                    }
                }
                if(request){
                    // Cas
                    request.setClient(id_client);                    
                    clients[id_client]['request']=request;
                }
            }
            // GET COMMANDS
            else if (GET_COMMANDS.indexOf(command[0])>=0){
                let keys = message.split(' ').filter((element) => element.length>0);
                keys.shift();
                memcached.getMulKeysValues(keys)
                        .then(data=>{
                            console.log(data);
                            let response='';
                            for (let i = 0; i < data.length; i++) {
                                const element = data[i];
                                if (command[0]==='get') {
                                    response+=`VALUE ${element.key} ${element.flags} ${element.bytes}\r\n${element.value}\r\nEND\r\n`;
                                }else{
                                    response+=`VALUE ${element.key} ${element.flags} ${element.bytes} ${element.cas_unique}\r\n${element.value}\r\nEND\r\n`;
                                }                               
                            }
                            socket.write(response);
                        })
                        .catch(err=>socket.write('\r\n'))
            }else{
                socket.write('ERROR\r\n');
            }
        }
    })
    socket.on('close',function () {
        console.log(`CONNECTION CLOSE BY address ${socket.remoteAddress} PORT ${socket.remotePort}`);
        delete clients[id_client];
    })
})
server.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`);
})
server.setMaxListeners(50);
setInterval( ()=> {
    memcached.removeKeysExpired(new Date().getTime())
        .then(data=>{
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                console.log(`the key ${element} has been deleted`); 
            }
        })
},1000)




class Request{

    constructor(command,key,flags,expiration_time,bytes,cas_unique,no_reply){
        this.command=command;
        this.key = key;
        this.flags=flags;
        if (expiration_time===0) {
            this.expires=false
        } else {
            this.expires=true
        }
        this.expiration_time=1000*expiration_time+ new Date().getTime();
        this.bytes=bytes;
        this.cas_unique=cas_unique;
        this.no_reply=no_reply;
        this.created = new Date().getTime();
    }
    setValue(value){
        this.value=value;
    }
    setClient(client){
        this.client=client;
    }
    prependValue(value){
        this.value=value+this.value;
        this.bytes +=value.length; 
    }
    appendValue(value){
        this.value+=value;
        this.bytes +=value.length; 
    }
}
module.exports = Request

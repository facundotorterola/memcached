
class Request{

    constructor(command,key,flags,expiration_time,bytes,cas_unique,no_reply){
        if (isNaN(flags) || isNaN(expiration_time) || isNaN(bytes) || isNaN(cas_unique) ) {
            throw new Error('CLIENT_ERROR header bad formed\r\nERROR\r\n');
        }

        if (bytes<0 || flags<0) {
            throw new Error('CLIENT_ERROR header bad formed\r\nERROR\r\n');
        }
        if (expiration_time===0) {
            this.expires=false
        } else {
            this.expires=true
        }
        this.command=command;
        this.key = key;
        this.flags=flags;
        this.expiration_time=1000*expiration_time+ new Date().getTime();
        this.bytes=bytes;
        this.cas_unique=cas_unique;
        this.no_reply=no_reply;
        this.created = new Date().getTime();
    }
    setValue(value){
        if (value.length === this.bytes){
            this.value=value;
        }else{
            throw new Error('CLIENT_ERROR bad data chunk\r\nERROR\r\n');
        }
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
module.exports = Request;

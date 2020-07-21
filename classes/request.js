const STORAGE_COMMANDS=['append','set','replace','add','prepend','cas'];

class Request{

    constructor(command,key,flags,expiration_time,bytes,no_reply,cas_unique=0){
        if (STORAGE_COMMANDS.indexOf(command)===-1) {
            throw new Error('CLIENT_ERROR header malformed\r\nERROR\r\n');
        }

        if (isNaN(flags) || isNaN(expiration_time) || isNaN(bytes) || isNaN(cas_unique) ) {
            throw new Error('CLIENT_ERROR header malformed\r\nERROR\r\n');
        }
        
        if (bytes<0 || flags<0) {
            throw new Error('CLIENT_ERROR header malformed\r\nERROR\r\n');
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
    }
    setValue(value){
        if (value.length === this.bytes){
            this.value=value;
        }else{
            throw new Error('CLIENT_ERROR bad data chunk\r\nERROR\r\n');
        }
    }
    setCas(cas){
        if (isNaN(cas)) {
            throw new Error('CLIENT_ERROR header malformed\r\nERROR\r\n');
        }else{
            this.cas_unique=cas;
        }
    }
    prependValue(value){
        this.value=value+this.value;
        this.bytes +=value.length; 
    }
    appendValue(value){
        this.value+=value;
        this.bytes +=value.length; 
    }
    stringGetsRequest(){
        return `VALUE ${this.key} ${this.flags} ${this.bytes} ${this.cas_unique}\r\n${this.value}\r\nEND\r\n`;
    }
    stringGetRequest(){
        return `VALUE ${this.key} ${this.flags} ${this.bytes}\r\n${this.value}\r\nEND\r\n`;
    }
}
module.exports = Request;

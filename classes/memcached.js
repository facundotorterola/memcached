class Memcached{
    constructor(){
        if (!Memcached.instance){
            this.store={};
            this.cas_unique={
                'id':0
            };
            Memcached.instance=this;
        }
        return Memcached.instance;
        
    };
    
    requestHandler(request) {
        let response;
        switch (request.command) {
            // Storage Commands
            case 'set':
                response = this.setKey(request);
                break;
            case 'add':
                response = this.addKey(request);
                break;
            case 'replace':
                response = this.replaceKey(request);
                break;
            case 'append':
                response = this.appendKey(request);
                break;
            case 'prepend':
                response = this.prependKey(request);
                break;
            case 'cas':
                response = this.casKey(request);
                break;
            default:
                break;
        }
       
        return response;        
    };
    // GET
    getKeyValue(key){
        return new Promise((resolve,reject)=>{
            if(this.store[key]){
                resolve(this.store[key]);
            }else{
                reject(new Error(`the store does not already hold data for this key [${key}]`));
            }
    
        })
    } 
    getMulKeysValues(keys) {    
        return new Promise((resolve,reject)=>{
            let values = [];

            for (let i = 0; i < keys.length; i++) {
                const element = keys[i];        
                if (this.store[element]) {
                   values.push(this.store[element])
                }   
            }
            if(values.length>0){
                resolve(values);
            }else{
                reject(new Error(`the store does not already hold data for this keys [${keys}]`));
            }
    
        })
    };
    
    // Storage
    // store this data, but only if the server *doesn't* already hold data for this key 
    addKey(request) {
        return new Promise((resolve,reject)=>{
            if (!this.store[request.key]) {
                request.setCas(this.cas_unique.id);
                this.cas_unique.id++;
                this.store[request.key]=request;
                resolve('STORED\r\n');
            }else{
                reject(new Error('NOT_STORED\r\n'));
            }  
        })
         
    };
    // replace this data, but only if the server *does* already hold data for this key 
    replaceKey(request) {    
        return new Promise((resolve,reject)=>{
            if (this.store[request.key]) {
                request.setCas(this.cas_unique.id);
                this.cas_unique.id++;
                this.store[request.key]=request;
                resolve('STORED\r\n');
            }else{
                reject(new Error('NOT_STORED\r\n'));
            }  
        })    
    }
    
    // add this data from the request to an existing key after existing data
    appendKey(request) {
        return new Promise((resolve,reject)=>{
            if (this.store[request.key]) {
                this.store[request.key].appendValue(request.value);
                resolve('STORED\r\n');
            }else{
                reject(new Error('NOT_STORED\r\n'));
            }  
    
        }) 
    }
    
    // add this data from the request to an existing key before existing data
    prependKey(request) {
        return new Promise((resolve,reject)=>{
            if (this.store[request.key]) {
                this.store[request.key].prependValue(request.value);
                resolve('STORED\r\n');
            }else{
                reject(new Error('NOT_STORED\r\n'));
            }    
        })
        
    }
    setKey(request) {
        return new Promise((resolve,reject)=>{
            request.setCas(this.cas_unique.id);
            this.cas_unique.id++;
            this.store[request.key]=request;
            resolve('STORED\r\n');
        });
    }
    // store this data but only if no one else has updated since I last fetched it.
    casKey(request) {
        return new Promise((resolve,reject)=>{
            if (this.store[request.key]) {
                
                if(this.store[request.key].cas_unique === request.cas_unique){
                    this.store[request.key]=request;
                    resolve('EXISTS\r\n');
                }else{
                    reject(new Error('ERROR\r\n'));
                }
            }else{
                reject(new Error('NOT_FOUND\r\n'));
            }
        })
        
    }
    // Remove data has expired
    removeKeysExpired(date) {
        return new Promise((resolve,reject)=>{
            let removed=[];
            for (const key in this.store) {
                if (this.store.hasOwnProperty(key)) {
                    const element = this.store[key];            
                    if (element.expires && element.expiration_time<date) {
                        removed.push(key);
                        delete this.store[key];
                    }
                }
            }
            resolve(removed);   
        });
        
    }
    
}
const instance = new Memcached();
Object.freeze(instance);


module.exports=instance;
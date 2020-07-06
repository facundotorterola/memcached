let store={};

// GET 
function getValue(keys) {
    
    
    return new Promise((resolve,reject)=>{
        let values = [];
        for (let i = 0; i < keys.length; i++) {
            const element = keys[i];        
            if (store[element]) {
               values.push(store[element])
            }   
        }
        if(values.length>0){
            resolve(values);
        }else{
            reject(new Error("the store doesn't already hold data for this keys ["+keys.toString()+"]"));
        }

    })
}

// Storage
// store this data, but only if the server *doesn't* already hold data for this key 
function addData(request) {
    return new Promise((resolve,reject)=>{
        if (!store[request.key]) {
            if (request.bytes!=request.value.length) {
                reject(new Error("The bytes send in the request and the length of the value does not match"));
            }
            store[request.key]=request;
            resolve(store[request.key]);
        }else{
            reject(new Error("the store does already hold data for this key"));
        }  
    })
     
}
// replace this data, but only if the server *does* already hold data for this key 

function replaceData(request) {    
    return new Promise((resolve,reject)=>{
        if (store[request.key]) {
            if (request.bytes!=request.value.length) {
                reject(new Error("The bytes send in the request and the length of the value does not match"));
            }
            store[request.key]=request;
            resolve(store[request.key]);
        }else{
            reject(new Error("the store doesn't already hold data for this key"));
        }  
    })    
}

// add this data from the request to an existing key after existing data
function appendData(request) {
    return new Promise((resolve,reject)=>{
        if (store[request.key]) {
            store[request.key].appendValue(request.value);
            store[request.key].setClient(request.client);
            resolve(store[request.key]);
        }else{
            reject(new Error("the store doesn't already hold data for this key"));
        }  

    }) 
}

// add this data from the request to an existing key before existing data
function prependData(request) {
    return new Promise((resolve,reject)=>{
        if (store[request.key]) {
            store[request.key].prependValue(request.value);
            store[request.key].setClient(request.client);
            resolve(store[request.key]);
        }else{
            reject(new Error("the store doesn't already hold data for this key"));
        }    
    })
    
}
function setData(request) {
    return new Promise((resolve,reject)=>{
        if (request.bytes!=request.value.length){
            reject(new Error("The bytes send in the request and the length of the value does not match"));
        }
        store[request.key]=request;
        resolve(store[request.key]);
    });
}
// store this data but only if no one else has updated since I last fetched it.
function casData(request) {
    return new Promise((resolve,reject)=>{
        if (store[request.key]) {
            if(store[request.key].client === request.client){
                if (request.bytes!=request.value.length) {
                    reject(new Error("The bytes send in the request and the length of the value does not match"));
                }
                store[request.key]=request;
                resolve(store[request.key]);
            }else{
                reject(new Error("the clients does not match"))
            }
        }else{
            reject(new Error("the store doesn't already hold data for this key"))
        }
    })
    
}
// Remove data has expired
function removeDataExpired(date) {
    return new Promise((resolve,reject)=>{
        var removed=[];
        for (const key in store) {
            if (store.hasOwnProperty(key)) {
                const element = store[key];            
                if (element.expires && element.expiration_time<date) {
                    removed.push(key);
                    delete store[key];
                }
            }
        }
        resolve(removed);   
    });
    
}

function cleanStore() {
    store={}
}

module.exports={
    get:getValue,
    add:addData,
    set:setData,
    replace:replaceData,
    append:appendData,
    prepend:prependData,
    removeExpired:removeDataExpired,
    cleanStore:cleanStore,
    cas: casData
}
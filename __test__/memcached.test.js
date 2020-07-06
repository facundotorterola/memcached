const memcached = require("../memcached");
const Request = require('../Request');
let cas_unique=0;
/* Request
        cmd
        key
        flags
        expiration_time in seconds
        bytes
        cas_unique
        no_reply
*/

describe("Testing add",()=>{
  
    
    let request = new Request("add","testing_add","0",200,7,cas_unique,0);
    request.setValue("testing");
    test("Testing add a new key",()=>{
        expect(memcached.add(request)).resolves.toStrictEqual(request);
        cas_unique++;
    });
    test("Testing add duplicated",()=>{
        memcached.add(request);
        let request_duplicated = new Request("add","testing_add",0,200,18,0,0);
        request_duplicated.setValue("testing_duplicated");
        expect(memcached.add(request_duplicated)).rejects.toStrictEqual(new Error("the store does already hold data for this key"))
    })
    test("Adding a Key which value and bytes does not match",()=>{
       let testing_length = new Request("add","testing_length",0,200,3,0,0);
       testing_length.setValue("testing_length");
       expect(memcached.add(testing_length)).rejects.toStrictEqual(new Error("The bytes send in the request and the length of the value does not match"))
   })
    

});

describe("Testing Set",()=>{
    let request = new Request("set","testing_set","0",200,7,cas_unique,0);
    request.setValue("testing");
    test("Setting a Key",()=>{
        expect(memcached.set(request)).resolves.toStrictEqual(request);
        cas_unique++;

    });
    test("Setting a Key which value and bytes does not match",()=>{
        let test_bytes = new Request("set","testing_bytes","0",200,0,0,0);
        test_bytes.setValue("testing");
        expect(memcached.set(test_bytes)).rejects.toStrictEqual(new Error("The bytes send in the request and the length of the value does not match"));
    });
})

describe("Testing Replace",()=>{
    let request = new Request("set","testing_replace","0",200,7,cas_unique,0);
    request.setValue("testing");
    memcached.set(request);
    cas_unique++;

    test("Testing replace key 'testing_replace'",()=>{
        request.setValue("testing_replace");
        request.bytes=15
        expect(memcached.replace(request)).resolves.toStrictEqual(request);
    })
    test("Testing replace a key which the store does not have data for this key",()=>{
        let request_replace = new Request("replace","testing_replace_error","0",200,7,0,0);
        request_replace.setValue("testing");
        expect(memcached.replace(request_replace)).rejects.toStrictEqual(new Error("the store doesn't already hold data for this key"));
    })
    test("Replacing a Key which value and bytes does not match",()=>{
        request.setValue("testing_replace_error");
        expect(memcached.replace(request)).rejects.toStrictEqual(new Error("The bytes send in the request and the length of the value does not match"));
    })
});

describe("Testing Prepend",()=>{
    let client="testing:00"
    let request = new Request("set","testing_prepend","0",200,7,cas_unique,0);
    request.setValue("prepend");
    request.setClient(client);
    memcached.set(request);
    cas_unique++;

    test("Testing append key 'testing_prepend'",()=>{
        request.prependValue("testing_");
        expect(memcached.prepend(request)).resolves.toStrictEqual(request);
    });
    test("Testing prepend a key which the store does not have data for this key",()=>{
        let request_prepend = new Request("prepend","testing_prepend_error","0",200,7,0,0);
        request_prepend.setValue("testing");
        expect(memcached.append(request_prepend)).rejects.toStrictEqual(new Error("the store doesn't already hold data for this key"));
    });
});

describe("Testing Append",()=>{
    let client="testing:00"
    let request = new Request("set","testing_append","0",200,7,cas_unique,0);
    request.setValue("testing");
    request.setClient(client);
    memcached.set(request);
    cas_unique++;

    test("Testing append key 'testing_append'",()=>{
        request.appendValue("_append");
        expect(memcached.append(request)).resolves.toStrictEqual(request);
    });
    test("Testing appending a key which the store does not have data for this key",()=>{
        let request_append = new Request("append","testing_append_error","0",200,7,0,0);
        request_append.setValue("testing");
        expect(memcached.append(request_append)).rejects.toStrictEqual(new Error("the store doesn't already hold data for this key"));
    });
});

describe("Testing Cas",()=>{
    let client="testing:00"
    let request = new Request("set","testing_cas","0",200,7,cas_unique,0);
    request.setValue("testing");
    request.setClient(client);
    memcached.set(request);
    cas_unique++;
    test("Testing cas key 'testing_cas'",()=>{
        let request_cas = new Request("cas","testing_cas","0",200,7,"cas_testing",0);
        request_cas.setValue("testing");
        request_cas.setClient(client);
        expect(memcached.cas(request_cas)).resolves.toStrictEqual(request_cas);
    });
    test("Testing cas a key which the store does not have data for this key",()=>{
        let request_cas = new Request("cas","testing_cas_error","0",200,7,"cas_testing",0);
        request_cas.setValue("testing");
        expect(memcached.cas(request_cas)).rejects.toStrictEqual(new Error("the store doesn't already hold data for this key"));
    });
    test("Testing cas  a key 'testing_cas' which has been updated",()=>{
        let request_error = new Request("set","testing_cas_error","0",200,7,cas_unique,0);
        request_error.setValue("testing");
        request_error.setClient(client);
        memcached.set(request_error);
        cas_unique++;

        let request_cas = new Request("replace","testing_cas_error","0",200,7,cas_unique,0);
        request_cas.setValue("testing");
        let other_client = "testing:01";
        request_cas.setClient(other_client);
        cas_unique++;
        memcached.replace(request_cas);

        let request_cas_error = new Request("cas","testing_cas_error","0",200,7,"cas_testing_error",0);
        request_cas_error.setValue("testing");
        request_cas_error.setClient(client);

        expect(memcached.cas(request_cas_error)).rejects.toStrictEqual(new Error("the clients does not match"));
    });
    test("Setting a Key which value and bytes does not match",()=>{
        let request_cas = new Request("cas","testing_cas","0",200,0,"cas_testing",0);
        request_cas.setValue("testing");
        request_cas.setClient(client);
        expect(memcached.set(request_cas)).rejects.toStrictEqual(new Error("The bytes send in the request and the length of the value does not match"));
    });


});

describe("Testing Get",()=>{
    let request_first_get = new Request("set","testing_get1","0",200,7,0,0);
    request_first_get.setValue("testing");
    memcached.set(request_first_get);
    let request_second_get = new Request("set","testing_get2","0",200,7,0,0);
    request_second_get.setValue("testing");
    memcached.set(request_second_get);

    test("Get the value of the  key 'testing'",()=>{
        expect(memcached.get(["testing_get1"])).resolves.toStrictEqual([request_first_get]);
    })
    test("Get the value of the  key 'testing, testing_get'",()=>{
        expect(memcached.get(["testing_get1","testing_get2"])).resolves.toStrictEqual([request_first_get,request_second_get]);
    })
    test("Get the value of the key 'testing_get_not_found' which is not stored in memcached",()=>{
        let key ="testing_get_not_found";
        expect(memcached.get([key])).rejects.toStrictEqual(new Error("the store doesn't already hold data for this keys ["+key+"]"));
    })
})



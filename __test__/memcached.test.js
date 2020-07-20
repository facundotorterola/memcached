const memcached =require('../classes/memcached');
const Request = require('../classes/request');
let cas_unique=0;
/* Request
        cmd
        key
        flags
        expiration_time in seconds
        bytes
        no_reply
        cas_unique [optional]

*/

describe('Testing add',()=>{
  
    
    let request = new Request('add','testing_add',0,200,7,0);
    request.setValue('testing');
    test('Testing add a new key',()=>{
        expect(memcached.addKey(request)).resolves.toStrictEqual('STORED\r\n');
        
    });
    test('Testing add duplicated',()=>{
        memcached.addKey(request);
        let request_duplicated = new Request('add','testing_add',0,200,18,0);
        request_duplicated.setValue('testing_duplicated');
        expect(memcached.addKey(request_duplicated)).rejects.toStrictEqual(new Error('NOT_STORED\r\n'))
    })

});

describe('Testing Set',()=>{
    let request = new Request('set','testing_set',0,200,7,0);
    request.setValue('testing');
    test('Setting a Key',()=>{
        expect(memcached.setKey(request)).resolves.toStrictEqual('STORED\r\n');
        

    });
  
})

describe('Testing Replace',()=>{
    let request = new Request('set','testing_replace',0,200,7,0);
    request.setValue('testing');
    memcached.setKey(request);
    

    test('Testing replace key "testing_replace"',()=>{
        let request_replace = new Request('replace','testing_replace',0,200,15,0);
        request_replace.setValue('testing_replace');
        expect(memcached.replaceKey(request_replace)).resolves.toStrictEqual('STORED\r\n');
    });
    test('Testing replace a key which the store does not have data for this key',()=>{
        let request_replace = new Request('replace','testing_replace_error',0,200,7,0);
        request_replace.setValue('testing');
        expect(memcached.replaceKey(request_replace)).rejects.toStrictEqual(new Error('NOT_STORED\r\n'));
    });
});

describe('Testing Prepend',()=>{
    let request = new Request('set','testing_prepend',0,200,7,0);
    request.setValue('prepend');
    memcached.setKey(request);
    

    test('Testing append key "testing_prepend" ',()=>{
        request.prependValue('testing_');
        expect(memcached.prependKey(request)).resolves.toStrictEqual('STORED\r\n');
    });
    test('Testing prepend a key which the store does not have data for this key',()=>{
        let request_prepend = new Request('prepend','testing_prepend_error',0,200,7,0);
        request_prepend.setValue('testing');
        expect(memcached.appendKey(request_prepend)).rejects.toStrictEqual(new Error('NOT_STORED\r\n'));
    });
});

describe('Testing Append',()=>{
    let client='testing:00'
    let request = new Request('set','testing_append',0,200,7,0);
    request.setValue('testing');
    memcached.setKey(request);
    

    test('Testing append key "testing_append"  ',()=>{
        request.appendValue('_append');
        expect(memcached.appendKey(request)).resolves.toStrictEqual('STORED\r\n');
    });
    test('Testing appending a key which the store does not have data for this key',()=>{
        let request_append = new Request('append','testing_append_error',0,200,7,0);
        request_append.setValue('testing');
        expect(memcached.appendKey(request_append)).rejects.toStrictEqual(new Error('NOT_STORED\r\n'));
    });
});

describe('Testing Cas',()=>{
    let request = new Request('set','testing_cas',0,200,7,0);
    request.setValue('testing');
    memcached.setKey(request);
    
    test('Testing cas key "testing_cas" ',()=>{
        memcached.getKeyValue('testing_cas').then(request_gets=>{
            let request_cas = new Request('cas','testing_cas',0,200,7,0,request_gets.cas_unique);
            request_cas.setValue('testing');
            expect(memcached.casKey(request_cas)).resolves.toStrictEqual('EXISTS\r\n');
        });
        
    });
    test('Testing cas a key which the store does not have data for this key',()=>{
        let request_cas = new Request('cas','testing_cas_error',0,200,7,0);
        
        request_cas.setValue('testing');
        expect(memcached.casKey(request_cas)).rejects.toStrictEqual(new Error('NOT_FOUND\r\n'));
    });
    test('Testing cas  a key "testing_cas" which has been updated',()=>{
        let request_error = new Request('set','testing_cas_error',0,200,7,0);
        request_error.setValue('testing');
        memcached.setKey(request_error);
        const request_gets = memcached.getKeyValue('testing_cas_error')
        let request_cas = new Request('replace','testing_cas_error',0,200,7,0);
        request_cas.setValue('testing');
        
        memcached.replaceKey(request_cas);

        let request_cas_error = new Request('cas','testing_cas_error',0,200,7,0,request_gets.cas_unique);
        request_cas_error.setValue('testing');

        expect(memcached.casKey(request_cas_error)).rejects.toStrictEqual(new Error('ERROR\r\n'));
    });
});

describe('Testing Get',()=>{
    let request_first_get = new Request('set','testing_get1',0,200,7,0);
    request_first_get.setValue('testing');
    memcached.setKey(request_first_get);
    let request_second_get = new Request('set','testing_get2',0,200,7,0);
    request_second_get.setValue('testing');
    memcached.setKey(request_second_get);

    test('Get the value of the  key "testing"',()=>{
        expect(memcached.getKeyValue('testing_get1')).resolves.toStrictEqual(request_first_get);
    })
    test('Get the value of the  key "testing, testing_get"',()=>{
        expect(memcached.getMulKeysValues(['testing_get1','testing_get2'])).resolves.toStrictEqual([request_first_get,request_second_get]);
    })
    test('Get the value of the key "testing_get_not_found" which is not stored in memcached',()=>{
        let key ='testing_get_not_found';
        expect(memcached.getKeyValue(key)).rejects.toStrictEqual(new Error(`the store does not already hold data for this key [${key}]`));
    })
})



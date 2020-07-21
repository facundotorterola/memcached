
const Request = require('../classes/request');
describe('Testing create Request',()=>{
  
    
    
    test('Testing create a successful request',()=>{
        const request = new Request('set','success_request',0,200,7,0);
        expect(request).not.toBeNull();
    });
    test('Testing header malformed [type of flag is string]',()=>{
        try {
            const request = new Request('set','error_test',"0",200,7,0);

        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR header malformed\r\nERROR\r\n'))
        }
    });
    test('Testing header malformed [value of flag is less than 0]',()=>{
        try {
            new Request('set','error_value_flag',-1,200,7,0);

        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR header malformed\r\nERROR\r\n'))
        }
    });
    test('Testing header malformed [no flag]',()=>{
        try {
            new Request('set','error_no_flag');

        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR header malformed\r\nERROR\r\n'))
        }
    });
    test('Testing header malformed [bad command]',()=>{
        try {
            new Request('error_bad_command','error',200,7,0);

        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR header malformed\r\nERROR\r\n'))
        }
    });

});

describe('Testing set value of a Request',()=>{
  
    
    
    test('Testing setting a successful value',()=>{
        const request = new Request('set','success_value',0,200,7,0);
        request.setValue('testing');
        expect(request.value).toStrictEqual('testing');
    });
    test('Testing setting a value which has more bytes than the request',()=>{
        try {
            const request = new Request('set','error_test',0,200,0,0);
            request.setValue('error');
        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR bad data chunk\r\nERROR\r\n'))
        }
    });
});

describe('Testing set cas of a Request',()=>{
  
    
    
    test('Testing setting a successful cas',()=>{
        const request = new Request('set','success_cas',0,200,7,0);
        request.setValue('testing');
        request.setCas(1);
        expect(request.cas_unique).toStrictEqual(1);
    });
    test('Testing setting a cas which is NaN',()=>{
        try {
            const request = new Request('set','error_cas',0,200,4,0);
            request.setValue('error');
            request.setCas("error");
        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR bad data chunk\r\nERROR\r\n'))
        }
    });
});


describe('Testing append value of a Request',()=>{
    test('Testing setting a successful appending',()=>{
        const request = new Request('set','success_appending',0,200,7,0);
        request.setValue('testing');
        request.appendValue("_appending")
        expect(request.value).toStrictEqual('testing_appending');
    });
});

describe('Testing prepend value of a Request',()=>{
    test('Testing setting a successful prepend',()=>{
        const request = new Request('set','success_prepend',0,200,7,0);
        request.setValue('prepend');
        request.prependValue("testing_")
        expect(request.value).toStrictEqual('testing_prepend');
    });
});
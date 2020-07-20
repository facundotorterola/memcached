
const Request = require('../classes/request');

describe('Testing create Request',()=>{
  
    
    
    test('Testing create a successful request',()=>{
        let request = new Request('set','success_request',0,200,7,0,0);
        expect(request).not.toBeNull();
    });
    test('Testing header bad formed [type of flag is string]',()=>{
        try {
            let request = new Request('set','error_test',"0",200,7,0,0);

        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR header bad formed\r\nERROR\r\n'))
        }
    });
    test('Testing header bad formed [value of flag is less than 0]',()=>{
        try {
            new Request('set','error_value_flag',-1,200,7,0,0);

        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR header bad formed\r\nERROR\r\n'))
        }
    });
    
    

});

describe('Testing set value of a Request',()=>{
  
    
    
    test('Testing setting a successful value',()=>{
        let request = new Request('set','success_value',0,200,7,0,0);
        request.setValue('testing');
        expect(request.value).toStrictEqual('testing');
    });
    test('Testing setting a value which has more bytes than the request',()=>{
        try {
            let request = new Request('set','error_test',0,200,0,0,0);
            request.setValue('error');
        } catch (error) {
            expect(error).toStrictEqual(new Error('CLIENT_ERROR bad data chunk\r\nERROR\r\n'))
        }
    });
});
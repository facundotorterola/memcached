const client = require("../client");
const port = 8010;

describe("Testing set", ()=>{  

    test("Setting a key", ()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="set testing_set 0 0 4\r\ntest\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("STORED\r\n");
        });
    });
    test("Setting a Key which bytes does not match",()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="set testing_set 0 20 4\r\nerror\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("CLIENT_ERROR bad data chunk\r\nERROR\r\n");
        });
    });
    test("Setting a key  with no reply", ()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="set testing_set_no_reply 0 20 4 1\r\ntest\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
     });
 });

});

describe("Testing add",()=>{  
    test("Adding a key", ()=>{
        client.init(port).then(async  clientSocket=>{
            let cmd = "add testing_add 0 1 4\r\ntest\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket);
            expect(response).toStrictEqual("STORED\r\n");
        });
    });
    test("Add a Key which bytes does not match", ()=>{
        client.init(port).then(async  clientSocket=>{
            let cmd = "add testing_add 0 1 4\r\nerror\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket);
            expect(response).toStrictEqual("CLIENT_ERROR bad data chunk\r\nERROR\r\n");
        });
    });
    test("Add a Key which the server does already hold data for this key",()=>{
        client.init(port).then(async  clientSocket=>{
            await client.send(clientSocket,"add testing_add_error 0 1 5\r\ntest1\r\n");
            let cmd = "add testing_add_error 0 1 5\r\ntest2\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket);
            expect(response).toStrictEqual("NOT_STORED\r\n");
        });
    });
    test("Adding a key  with no reply",()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="add testing_add_no_reply 0 1 4 1\r\ntest\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
        });
    });
    
});

describe("Testing replace", () =>{   
    test("Testing replace key 'testing_replace'", ()=>{
         client.init(port).then(async  clientSocket=>{
            await client.send(clientSocket,"set testing_replace 0 20 4\r\ntest\r\n");
            let cmd = "replace testing_replace 0 20 7\r\nreplace\r\n"
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket);
            expect(response).toStrictEqual("STORED\r\n");
        });
    });
     test("Replace a Key which bytes does not match", ()=>{
         client.init(port).then(async  clientSocket=>{
            let cmd = "replace testing_replace_bytes 0 20 7\r\nerror\r\n"
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket);
            expect(response).toStrictEqual("CLIENT_ERROR bad data chunk\r\nERROR\r\n");
        });
    });
     test("Replace a Key which the server does not already hold data for this key", async ()=>{
         client.init(port).then(async  clientSocket=>{
            let cmd = "replace testing_replace_not_stored 0 20 5\r\nerror\r\n"
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket);
            expect(response).toStrictEqual("NOT_STORED\r\n");
        });
    });
    test("Replacing a key  with no reply",()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="set testing_replace_no_reply 0 20 4\r\ntest\r\n";
            await client.send(clientSocket,cmd);
            cmd="replace testing_replace_no_reply 0 20 8 1\r\nno_reply\r\n";

            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
        });
    });
});

describe("Testing append", () =>{   
    test("Testing append the key 'testing_append'", ()=>{
       client.init(port).then(async  clientSocket=>{
          await client.send(clientSocket,"set testing_append 0 20 4\r\ntest\r\n");
          let cmd = "append testing_append 0 20 7\r\n_append\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
          expect(response).toStrictEqual("STORED\r\n");
      });
    });
   test("append a Key which bytes does not match", ()=>{
       client.init(port).then(async  clientSocket=>{
          let cmd = "append testing_append_bytes 0 20 7\r\nerror\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
        expect(response).toStrictEqual("CLIENT_ERROR bad data chunk\r\nERROR\r\n");
      });
    });
   test("Append a Key which the server does not already hold data for this key",()=>{
       client.init(port).then(async  clientSocket=>{
          let cmd = "append testing_append_not_stored 0 20 5\r\nerror\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
          expect(response).toStrictEqual("NOT_STORED\r\n");    
        });
    });
  test("Appending a key  with no reply",()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="set testing_append_no_reply 0 20 2\r\nno\r\n";
            await client.send(clientSocket,cmd);
            cmd="append testing_append_no_reply 0 20 6 1\r\n_reply\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
            });
    });
});

describe("Testing prepend", () =>{   
    test("Testing prepend the key 'testing_prepend'", ()=>{
       client.init(port).then(async  clientSocket=>{
          await client.send(clientSocket,"set testing_prepend 0 20 7\r\nprepend\r\n");
          let cmd = "append testing_prepend 0 20 5\r\ntest_\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
          expect(response).toStrictEqual("STORED\r\n");
      });
    });
   test("prepend a Key which bytes does not match", ()=>{
       client.init(port).then(async  clientSocket=>{
          let cmd = "prepend testing_prepend_bytes 0 20 7\r\nerror\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
        expect(response).toStrictEqual("CLIENT_ERROR bad data chunk\r\nERROR\r\n");
      });
    });
   test("Prepend a Key which the server does not already hold data for this key", async ()=>{
       client.init(port).then(async  clientSocket=>{
          let cmd = "prepend testing_prepend_not_stored 0 20 5\r\nerror\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
          expect(response).toStrictEqual("NOT_STORED\r\n");
      });
    });
    test("Prepending a key  with no reply",()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="set testing_prepend_no_reply 0 20 6\r\n_reply\r\n";
            await client.send(clientSocket,cmd);
            cmd="prepend testing_prepend_no_reply 0 20 2 1\r\nno\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
        });
    });
});

describe("Testing cas", () =>{   
    test("Testing cas the key 'testing_cas'", ()=>{
       client.init(port).then(async  clientSocket=>{
          await client.send(clientSocket,"set testing_cas 0 0 4\r\ntest\r\n");
          let cmd = "cas testing_cas 0 0 11 testing_cas\r\ntesting_cas\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
          expect(response).toStrictEqual("EXISTS\r\n");
      });
  });
   test("Cas a Key which the server does not already hold data for this key", async ()=>{
       client.init(port).then(async  clientSocket=>{
          let cmd = "cas testing_cas_not_stored 0 20 5 testing_cas\r\nerror\r\n"
          let response = await client.send(clientSocket,cmd);
          await client.close(clientSocket);
          expect(response).toStrictEqual("NOT_FOUND\r\n");
      });
  });
  test("Testing cas a key 'testing_cas_client_error' which has been updated", ()=>{
    client.init(port).then(async  clientSocket=>{
         await client.send(clientSocket,"set testing_cas_client_error 0 20 4\r\ntest\r\n");
         await client.init(port).then(async otherClient=>{
             await client.send(otherClient,"replace testing_cas_client_error 0 20 20\r\ntesting_client_error\r\n");
             await client.close(otherClient);
         });
         let cmd = "cas testing_cas_client_error 0 20 24 cas_testing\r\ntesting_cas_client_error\r\n"
         let response = await client.send(clientSocket,cmd);
         await client.close(clientSocket);
         expect(response).toStrictEqual("ERROR\r\n");
        });
    });
});
describe("Testing get",  ()=>{  
     
    test("Get the value of a key", ()=>{
        client.init(port).then(async clientSocket=>{
            await client.send(clientSocket,"set testing_get 0 20 4\r\ntest\r\n");
            let cmd="get testing_get \r\n";
            let reply ="VALUE testing_get 0 4\r\ntest\r\nEND\r\n"
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual(reply);
        });
    }); 
    test("Get the value of more than one key", ()=>{
        client.init(port).then(async clientSocket=>{
            await client.send(clientSocket,"set testing_get1 0 20 5\r\ntest1\r\n");
            await client.send(clientSocket,"set testing_get2 0 20 5\r\ntest2\r\n");

            let cmd="get testing_get1 testing_get2\r\n";
            let reply ="VALUE testing_get1 0 5\r\ntest1\r\nEND\r\n";
            reply+="VALUE testing_get2 0 5\r\ntest2\r\nEND\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual(reply);
        });

    });

    test("Get the value of more than one key", ()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="get testing_get_not_stored\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
        });
            
    });
});
describe("Testing gets",  ()=>{  
    test("Gets the value of a key", ()=>{
        client.init(port).then(async clientSocket=>{
            await client.send(clientSocket,"set testing_gets 0 20 4\r\ntest\r\n");
            await client.send(clientSocket,"cas testing_gets 0 20 4 cas_gets\r\ntest\r\n");

            let cmd="gets testing_gets \r\n";
            let reply ="VALUE testing_gets 0 4 cas_gets\r\ntest\r\nEND\r\n"
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toBe(reply);
        });
    }); 
    test("Gets the value of more than one key", ()=>{
        client.init(port).then(async clientSocket=>{
            await client.send(clientSocket,"set testing_gets1 0 20 5\r\ntest1\r\n");
            await client.send(clientSocket,"cas testing_gets1 0 20 5 cas_mto_gets1\r\ntest1\r\n");

            await client.send(clientSocket,"set testing_gets2 0 20 5\r\ntest2\r\n");
            await client.send(clientSocket,"cas testing_gets2 0 20 5 cas_mto_gets2\r\ntest2\r\n");

            let cmd="gets testing_gets1 testing_gets2\r\n";
            let reply ="VALUE testing_gets1 0 5 cas_mto_gets1\r\ntest1\r\nEND\r\n";
            reply+="VALUE testing_gets2 0 5 cas_mto_gets2\r\ntest2\r\nEND\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual(reply);
        });
        
    });
    test("Gets the value of more than one key", ()=>{
        client.init(port).then(async clientSocket=>{
            let cmd="gets testing_get_not_stored\r\n";
            let response = await client.send(clientSocket,cmd);
            await client.close(clientSocket); 
            expect(response).toStrictEqual("\r\n");
        });
    });
});

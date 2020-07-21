# 1 Precondiciones :

Antes de ejecutar el servidor se necesita instalar las dependencias en el archivo package.json, para esto debemos ejecutar el siguiente comando 
npm install package.json

# 2 Ejecutar el servidor:

una vez instaladas las dependencias podremos ejecutar el servidor para ejecutarlo debemos correr el siguiente comando 
***npm start*** 

El servidor estará corriendo en el puerto **8010**

# 3 Ejecutar pruebas unitarias:

Primero deberemos ejecutar el servidor ejecutando el comando:
node server.js 

Y luego debemos debemos ejecutar el comando:
npm test

# 4 Ejecutar Cliente(telnet):

Primero deberemos ejecutar el servidor ejecutando el comando:
***npm start*** 

Y luego debemos debemos ejecutar el cliente:
***telnet localhost 8010***

 una vez ejecutado el cliente podremos utilizar la memoria caché.

# 4 Ejemplos de Comandos
## 4.1 Comandos de alamacenamiento:
Existen 6 **Comandos de Almacenamiento**  los cuales son:

**set**: Almacena un valor para una clave

**add**:Almacena un valor para una clave, si la clave no se encuentra en la cache

**replace**:Replaza el valor para una clave en la cache, si la misma se encuentra en la cache

**append**:Agrega al final un valor para una clave, si la misma se encuentra en la cache

**prepend**:Agrega al principio un valor para una clave, si la misma se encuentra en la cache

**cas**:Alamacena un valor para una clave, si la misma se encuentra en la cache y el valor del **cas_unique** coniside con el de la cache 
	
## 4.1.1 Formato de comandos de almacenamiento:

El formato para enviar los comandos de almacenamiento es el siguiente.

***cmd key flags exp_time bytes [no_reply] \r\n
data\r\n***

**cmd**:Será el comando a ejecutar ejemplo set,add,replace,prepend,append

**key**: Es la llave cual queremos guardar.

**flags**: Es un entero arbitrario sin signo de 16 bits.

**exp_time**: Es un entero que significa cuantos segundos estará almacenada en la caché 

**bytes**:Es la cantidad de bytes que tiene data sin incluir el \r\n

**[no_reply]**: (Opcional) Se utiliza si no queremos recibir una respuesta 

En caso que el comando a ejecutar sea **cas** el formato es el siguiente

***cas key flags exp_time bytes cas_unique [no_reply] \r\n
data\r\n***

Donde **cas_unique** es un valor anteriormente guardado por el sevidor que se obtiene cuando realizamos el comando **gets**
**data**: Es la información a guardar en la caché.

## 4.2 Comandos de obtención:
Existen 2 **Comandos de obtención**  los cuales son:

**get**: Se obtiene a partir de una clave su valor sus **flags** y sus **bytes**


**gets**:Se obtiene a partir de una clave su valor sus **flags** ,sus **bytes**  y el valor del **cas_unique**

## 4.2.1 Formato de  comandos de obtención:

El formato para enviar los comandos de obtención es el siguiente.

***cmd keys \r\n***

**cmd**:Será el comando a ejecutar ejemplo get o gets.

**key**: Son las llaves cual queremos obtener.

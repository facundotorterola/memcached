# 1 Precondiciones :

Antes de ejecutar el servidor se necesita instalar las dependencias en el archivo package.json, para esto debemos ejecutar el siguiente comando 
npm install package.json

# 2 Ejecutar el servidor:

una vez instaladas las dependencias podremos ejecutar el servidor para ejecutarlo debemos correr el siguiente comando 
***node server.js*** 

El servidor estará corriendo en el puerto **8010**

# 3 Ejecutar pruebas unitarias:

Primero deberemos ejecutar el servidor ejecutando el comando:
node server.js 

Y luego debemos debemos ejecutar el comando:
npm test

# 4 Ejecutar Cliente(telnet):

Primero deberemos ejecutar el servidor ejecutando el comando:
***node server.js*** 

Y luego debemos debemos ejecutar el cliente:
***telnet localhost 8010***

 una vez ejecutado el cliente podremos utilizar la memoria caché.

# 4 Ejemplos de Comandos
	
## 4.1 Comandos de almacenamiento:

El formato para enviar los comandos de almacenamiento es el siguiente.

***cmd key flags exp_time bytes \r\n
data\r\n***

**cmd**:Será el comando a ejecutar ejemplo set,add,replace,prepend,append y cas.

**key**: Es la llave cual queremos guardar.

**flags**: Es un entero arbitrario sin signo de 16 bits.

**exp_time**: es cuantos segundos estará almacenada en la caché

**bytes**:Es la cantidad de bytes que tiene data sin incluir el \r\n

**data**: Es la información a guardar en la caché.

## 4.1 Comandos de obtención:

El formato para enviar los comandos de obtención es el siguiente.

***cmd keys \r\n***

**cmd**:Será el comando a ejecutar ejemplo get o gets.

**key**: Son las llaves cual queremos obtener.

# jeli.flat.file

Javascript Database for NodeJS developement
## Simple API
 ```
    select(query)
    insert(data)
    update(data, query)
    delete(query)
    drop()
   ```
   
 ###usuage
``` var jff = require('jeli.flat.file');
 var instance = new jff({
  folderPath: '/tmp/',
  name: 'dbName'
 }, callback);
 
 var tableInstance = instance.create('tableName', ['firstName','lastName'])
 ```
 
 

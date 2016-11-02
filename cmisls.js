#!/usr/local/node-v4.6.0-linux-x64/bin/node
/*
 Also try...
 * var Promise = require("bluebird");
 * var bhttp = require("bhttp");
 * https://www.npmjs.com/package/bhttp
 */
var fs = require("fs");
var winston = require('winston');
var logLevel = 'info';
// cmis-user.json format: {"username": "user", "password": "9cz0iiasf90ui"}

var cmisUser = require("./cmis-user.json");
var cmis = require('cmis');
var maxdepth = -1;
var folderPath = '';
var name = '';

winston.add(winston.transports.File, {
  filename: './cmis-utils.log',
  level: logLevel
});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: 'error'});

//console.log(cmisUser);
function help()
{
  console.log('Incorrect usage:');
  console.log(process.argv[1] +
      ' /Sites/site-name/documentLibrary/' +
      ' [-l] ');
}

process.argv.forEach(function (val, index, array)
{
  if (index == 2 && array[index] !== undefined)
  {
    folderPath = array[index];
    winston.log('searching name: , path: ' + folderPath);
  }
  else if (folderPath !== undefined)
  {
    switch (val)
    {
      case '-maxdepth':
        maxdepth = array[index + 1];
        break;
      case '-name':
        name = array[index + 1];
        break;
      case '-loglevel':
        logLevel = array[index + 1];
        break;
    }
  }
});

if (folderPath === '')
{
  help();
  process.exit();
}
winston.log('info', 'searching path: ' + folderPath);

var session = cmis.createSession(cmisUser.url);
session.setCredentials(cmisUser.username, cmisUser.password);
session.loadRepositories().ok(function (data)
{
  //console.log(folderPath);
  session.getObjectByPath(folderPath).ok(function (subfolder)
  {
    //console.log(subfolder);
    session.getChildren(subfolder.succinctProperties['cmis:objectId']).ok(
        function (child)
        {
          for (var i = 0; i < child.objects.length; i++)
          {
            console.log(
                child.objects[i].object.succinctProperties['cmis:name']);
          }
        });
  });
});
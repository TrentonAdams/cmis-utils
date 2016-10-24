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
var attributes = "cmis:name, cmis:objectId";

winston.add(winston.transports.File, {
  filename: './file-utils.log',
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
      ' [-maxdepth #] [-name SQL-like-query] [-loglevel info,error,debug] ');
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
session.loadRepositories().ok(function (data) {
  winston.log('debug', '{data:', data, '}');
  // get the actual folder being searched
  session.getObjectByPath(folderPath).ok(function (data) {
    var likeQuery = name != '' ?
        ("cmis:name LIKE '" + name + "'\n    AND ") : '';
    var query = "" +
        " SELECT " + attributes + "\n" +
        "   FROM cmis:document \n" +
        "  WHERE " + likeQuery +
        "        IN_TREE('" + data.succinctProperties['cmis:objectId'] +
        "') \n";
    winston.log('debug', query);
    session.query(query, false).ok(function (data)
    {
      for (i = 0; i < data.results.length; i++)
      {
        winston.log('debug', data.results[i]);
        console.log(data.results[i].succinctProperties['cmis:objectId']);
      }
    }).notOk(function (data)
    {
      console.log('error: ', data);
    });
  });
});


//session.defaultRepository.rootFolderUrl = "/alfresco/service/api/sites/AU-STUDENTS";
//console.log(session.getACL());


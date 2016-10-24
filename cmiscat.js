"use strict";
/*
 Also try...
 * var Promise = require("bluebird");
 * var bhttp = require("bhttp");
 * https://www.npmjs.com/package/bhttp
 */
// cmis-user.json format: {"username": "user", "password": "9cz0iiasf90ui"}

var cmis = require('cmis');
var winston = require('winston');
var url = require('url');
var fs = require('fs');
var cmisUser = require("./cmis-user.json");
var objectId = '';
var logLevel = 'info';
var request = require('request');

winston.add(winston.transports.File, {
  filename: './file-utils.log',
  level: logLevel
});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: 'error'});


function help()
{
  console.log('Incorrect usage:');
  console.log('Accepts direct input from cmisfind.js through a unix pipe');
  console.log(process.argv[1] +
      ' workspace://SpacesStore/a32d1179-3663-478f-a489-8ad82602accf;1.0');
}

process.argv.forEach(function (val, index, array)
{
  if (index == 2 && array[index] !== undefined)
  {
    objectId = array[index];
    objectId = objectId.replace(/.*\/(.*);.*/, '$1');
  }
});

if (objectId === '')
{
  help();
  process.exit();
}

var session = cmis.createSession(cmisUser.url);
session.setCredentials(cmisUser.username, cmisUser.password);
session.loadRepositories().ok(function (data)
{
  winston.log('debug', '{data: ', data, '}');
  // get the actual folder being searched
  var contentUrl = session.getContentStreamURL(objectId, true);

  request(contentUrl, {
    encoding: null, 'auth': {
      'user': cmisUser.username,
      'pass': cmisUser.password,
      'sendImmediately': false
    }
  }, function (error, response, body)
  {
    process.stdout.write(body);
  });
}).notOk(function (data)
{
  winston.log('error', 'failed to retrieve repository information: ', data);
});
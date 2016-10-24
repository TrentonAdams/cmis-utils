#!/usr/bin/node
/*
 Also try...
 * var Promise = require("bluebird");
 * var bhttp = require("bhttp");
 * https://www.npmjs.com/package/bhttp
 */
var fs = require("fs");
var winston = require('winston');
var logLevel = 'debug';
// cmis-user.json format: {"username": "user", "password": "9cz0iiasf90ui"}

var cmisUser = require("./cmis-user.json");
var cmis = require('cmis');

function help()
{
    console.log('Incorrect usage:');
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

winston.add(winston.transports.File, { filename: './cmis-utils.log',
    level: logLevel});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { level: 'error' });


var session = cmis.createSession(cmisUser.url);
session.setCredentials(cmisUser.username, cmisUser.password);
var repositories = session.loadRepositories().ok(function (data)
{
    winston.log('debug', '{data:', data, '}');
    session.deleteObject(objectId, true).ok(function (data)
    {
        console.log("remove: " + objectId);
    }).notOk(function(data){
        console.log('error: ', data);
    });
});


//session.defaultRepository.rootFolderUrl = "/alfresco/service/api/sites/AU-STUDENTS";
//console.log(session.getACL());


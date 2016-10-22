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
var folderName = '';
var folderPath = '';
var name = '';
var attributes = "cmis:name, cmis:objectId";

console.log(cmisUser);
function help()
{
    console.log('Incorrect usage:');
    console.log(process.argv[1] +
        ' /Sites/office-of-the-registrar/documentLibrary/' +
        'EnterpriseFolderDoesntExistAPAS [-maxdepth #] ' +
        '[-name SQL-like-query] [-loglevel info,error,debug] ');
}

process.argv.forEach(function (val, index, array) {
    if (index == 2 && array[index] !== undefined)
    {
        folderPath = array[index];
        folderName = folderPath.replace(/.*\/(.*)/, '$1');
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

if (folderPath === '' || folderName === '')
{
    help();
    process.exit();
}
winston.log('info', 'searching name: ' + folderName + ', path: ' + folderPath);

winston.add(winston.transports.File, { filename: './cmisfind.log',
    level: logLevel});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { level: 'error' });


var session = cmis.createSession(cmisUser.url);
session.setCredentials(cmisUser.username, cmisUser.password);
var repositories = session.loadRepositories().ok(function (data)
{
    winston.log('debug', '{data:', data, '}');
    session.query("" +
        " SELECT * " +
        "   FROM cmis:folder " +
        "  WHERE cmis:name = '" + folderName + "'",
        false).ok(function (data)
    {
        var auStudents = {'cmis:objectId': undefined};
        winston.log('debug', data);
        for (i = 0; i< data.results.length; i++)
        {
            winston.log('debug', "au-students: ", data.results[i]);
            if (data.results[0].succinctProperties['cmis:path'] == folderPath)
            {
                auStudents = data.results[0].succinctProperties;
                winston.log('info', auStudents['cmis:objectId']);
                var likeQuery = name != '' ?
                    ("cmis:name LIKE '" + name + "'\n    AND ") : '';
                var query = "" +
                    " SELECT " + attributes +"\n" +
                    "   FROM cmis:document \n" +
                    "  WHERE " + likeQuery +
                    "        IN_TREE('" + auStudents['cmis:objectId'] + "') \n";
                winston.log('debug', query);
                session.query(query, false).ok(function (data)
                {
                    for (i = 0; i< data.results.length; i++)
                    {
                        winston.log('debug', data.results[i]);
                        console.log(data.results[i].succinctProperties['cmis:objectId']);
                    }
                }).notOk(function(data) {
                    console.log('error: ', data);
                });
            }
        }
    }).notOk(function(data){
        console.log('error: ', data);
    });
});


//session.defaultRepository.rootFolderUrl = "/alfresco/service/api/sites/AU-STUDENTS";
//console.log(session.getACL());


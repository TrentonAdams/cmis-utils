#!/usr/bin/node
/*
 Also try...
 * var Promise = require("bluebird");
 * var bhttp = require("bhttp");
 * https://www.npmjs.com/package/bhttp
 */
// cmis-user.json format: {"username": "user", "password": "9cz0iiasf90ui"}

var cmisUser = require("./cmis-user.json");
var objectId = '';

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

var Client = require('node-rest-client').Client;

var client = new Client({
    user: cmisUser.username,
    password: cmisUser.password
});

// registering remote methods
client.registerMethod("jsonMethod",
    "https://banalf-test.athabascau.ca/alfresco/api/-default-/public/cmis/versions/1.1/atom/content?id=" +
    objectId, "GET");

client.methods.jsonMethod(function (data, response) {
    console.log(data.toString('binary'));
    // raw response
//    DEBUG console.log(response);
});
const express = require('express');
const app = express();
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const Multer = require('multer');
var R = require("r-script");
const FCM = require('fcm-push');
var CronJob = require('cron').CronJob;
//var exec = require('exec');
var async = require('async');
var fs = require('fs');
// client account
/*
const storage = googleStorage({
	  projectId: "sincere-point-194021",
	  keyFilename: "sincere-point-194021-firebase-adminsdk-f19yp-799fcbd5cd.json"
});
var serverKey = 'AAAAc3RnsrU:APA91bGKzT3EUZ9erDRJHw0yTSR-VvuKAy-ZubAA3pvGzcV9Sk2v4ovANsD_7ceI4TuBDV9t6Z02L6mc6igF533VX53xVYLtDBU6xvJh8CpLn6ZzaV1JWYrISuvlmyyj_SoSAhI0grVP';
var bucketName = "sincere-point-194021.appspot.com";
var destinationBucket = "sincere-point-194021";
var destinationBreathDitectedBucket = "sincere-point-194021-5h2k1";
var imageUrl = "https://firebasestorage.googleapis.com/v0/b/sincere-point-194021.appspot.com/o/";
*/

// our account

const storage = googleStorage({
  projectId: "testgcpproject-195312",
  keyFilename: "testgcpproject-195312-firebase-adminsdk-swj0i-881ada524c.json"
});
var serverKey = 'AAAADt_goE4:APA91bFnQQUewoQH4ApWLvjzgemywM4sdzij69TU5dCmdivCbfo9G1jp-lOkRft_HVcoqP6pcgGk60GdJMK73zSejGBRly5hR4E0Zjwq6JNaLQEg2LjVNIon5DfkBwZ7L3DP8QVxxbj3';
var bucketName = "testgcpproject-195312.appspot.com";
var destinationBucket = "testgcpproject-195312";
var destinationBreathDitectedBucket = "testgcpproject-195312-f5uzh";
var imageUrl = "https://firebasestorage.googleapis.com/v0/b/testgcpproject-195312.appspot.com/o/";


/*
new CronJob('* * * * * *', function() {
	//rewriteFile();
  fs.readFile("config.txt", "utf8", function (err, content) {
          if(content === "TRUE"){
            //  console.log(content);
              imageAnalysis();
          }
  });
}, null, true, 'America/Los_Angeles');
*/


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/*
Node js code to run the image analysis by rscript
*/
var https = require('https');
var fs = require('fs');
var request = require('request-promise');

var push_array = [];
var count  ;
var i =0;
//imageAnalysis();
const exec = require('child_process').exec;

/* app.get('/:image',function(req,res){
     console.log("inside get")
     var image=req.params;
     //imageAnalysisSample(image);
     res.status(200).send({message:"image is received",image:JSON.stringify(image)})
  })
*/
app.get('/getImageStatus', function(req, res){
  var image=req.query.id;
  if(image){
    console.log(image);
 storage .bucket(bucketName).file(image).getMetadata().then(function(col) {
        var metadata = col[0] ; var commands ;
        var files = []; var filesList = [];
        console.log(metadata);
        if( typeof metadata.metadata.deviceID!=="undefined"){
            var base_link = imageUrl+metadata.name+"?alt=media";
             commands = 'Rscript ex-sync.R '+ metadata.name + " "+metadata.metadata.deviceID+ " "+metadata.metadata.sessionID;
            let redata = request(base_link);
            console.log(commands);
            redata.pipe(fs.createWriteStream(metadata.name));
            files.push(redata);
            filesList.push(metadata.name);

            Promise.all(files).then(function(resultd) {
               exec(commands, function(err, data) {
                 var asyncDelete = []; var asyncMoveNotDetected=[];var asyncMoveDetected=[];
                 var message ;
                 var status = JSON.stringify(data).split(" ");
                 console.log("R response"+status);
                  if(status.length === 5){
                      console.log("inside");
                      var finalStaus = status[1].split('\\')[0];
                      var filename = status[2].split('"')[1].split('\\')[0];
                      var token = status[3].split('\\')[1].split("\"")[1];
                      var sessionID = status[4].split('\\')[1].split("\"")[1];
                      message = {    to: token, // required fill with device token or topics
                                     sessionID : sessionID,
                                     breathDetected :finalStaus };

                      if (finalStaus.toLowerCase() ==="false") {
                         asyncMoveNotDetected.push(storage.bucket(bucketName).file(filename).copy(storage.bucket(destinationBucket).file(filename)));
                         asyncDelete.push(filename);
                       }else {
                         asyncMoveNotDetected.push(storage.bucket(bucketName).file(filename).copy(storage.bucket(destinationBreathDitectedBucket).file(filename)));
                         asyncDelete.push(filename);
                       }

                       Promise.all(asyncMoveNotDetected).then((moveRsultDnot) => {
                         console.log("all moved");
                             var asyncDeleteFiles = [];
                             async.forEach(asyncDelete, function(filename, callback){
                               asyncDeleteFiles.push(storage.bucket(bucketName).file(filename).delete());
                             });
                             console.log("delete length"+asyncDeleteFiles.length);
                             Promise.all(asyncDeleteFiles).then((moveRsultDnot) => {
                               console.log("all files deleted."+moveRsultDnot);
                                async.forEach(filesList, function(filename, callback){
                                   fs.unlinkSync(filename);
                                 });
                               res.status(200).send({message:"image is received",data:message})
                             }).catch(err => {
                               console.error('ERROR:', err);
                               res.status(400).send({message:err,data:""})
                             });
                         }).catch(err => {
                           console.error('ERROR:', err);
                           res.status(400).send({message:err,data:""})
                         });
                    }
              });
            });
        }else {
          console.log("else part");
          res.status(400).send({message:"No device Id in metadata"})
        }

  }).catch(err => {
    console.error('ERROR:', err);
    res.status(400).send({message:"File not found in the cloud",data:""})
  });
   }else {
  res.status(400).send({message:"image name not found",data:""})
  }
});



var stdoutdata = [];
function execute(script) {
  return new Promise((resolve, reject) => {
      exec(script, (error, stdout, stderr) => {
             if (error) {
               reject(stderr);
            } else {
             console.log("outputs"+stdout);
             stdoutdata.push(stdout);
             resolve(stdout);
            }
          });
    });
}


function rewriteFile(){
  var stream = fs.createWriteStream("config.txt");
  stream.once('open', function(fd) {
    stream.write("TRUE");
    stream.end();
  });
}

function runCommands(array, callback) {
    var index = 0;
    var results = [];
    function next() {
       if (index < array.length) {
           exec(array[index++], function(err, stdout) {
               //if (err) return callback(err);
               // do the next iteration
               results.push(stdout);
               next();
           });
       } else {
           // all done here
           callback(null, results);
       }
    }
    // start the first iteration
    next();
}


app.listen(8082, () => {
  console.log('App listening to port 8082');
});

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


/*
var Jimp = require("jimp");

var myArr = new Array();
myArr[0] = new Array(2,1, 5);
myArr[1] = new Array(3,1, 4);



function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function standardDeviation(values){
  var avg = average(values);
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

/* var arr = [2, 11, 37, 42];
a = shuffle(arr);
console.log(a);
console.log(average(a));
console.log(standardDeviation(a));
*/

/*Jimp.read("1520316960165.jpg").then(function (image) {
    // do stuff with the image
  //  console.log(image);
  //  console.log(image.bitmap.width);
    console.log(image.bitmap.data);
    var imgGrey = image.greyscale();
    console.log(imgGrey);
   imgGrey.scan(0, 0, imgGrey.bitmap.width, imgGrey.bitmap.height, function (x, y, idx) {
    // x, y is the position of this pixel on the image
    // idx is the position start position of this rgba tuple in the bitmap Buffer
    // this is the image

    var red   = this.bitmap.data[ idx + 0 ];
    var green = this.bitmap.data[ idx + 1 ];
    var blue  = this.bitmap.data[ idx + 2 ];
    var alpha = this.bitmap.data[ idx + 3 ];
    console.log(alpha);

    // rgba values run from 0 - 255
    // e.g. this.bitmap.data[idx] = 0; // removes red from this pixel
   });

}).catch(function (err) {
    // handle an exception
});

*/

// client account
/* const storage = googleStorage({
  projectId: "sincere-point-194021",
  keyFilename: "sincere-point-194021-firebase-adminsdk-f19yp-799fcbd5cd.json"
});
var bucketName = "sincere-point-194021.appspot.com";
var destinationBucket = "sincere-point-194021";
var destinationBreathDitectedBucket = "sincere-point-194021-5h2k1";
var serverKey = 'AAAAc3RnsrU:APA91bGKzT3EUZ9erDRJHw0yTSR-VvuKAy-ZubAA3pvGzcV9Sk2v4ovANsD_7ceI4TuBDV9t6Z02L6mc6igF533VX53xVYLtDBU6xvJh8CpLn6ZzaV1JWYrISuvlmyyj_SoSAhI0grVP';
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


new CronJob('* * * * * *', function() {
  fs.readFile("config.txt", "utf8", function (err, content) {
          if(content === "TRUE"){
            //  console.log(content);
           imageAnalysis();
          }
        /*  var stream = fs.createWriteStream("config.txt");
            stream.once('open', function(fd) {
            stream.write("TRUE");
            stream.end();});
            */
  });
}, null, true, 'America/Los_Angeles');


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/*
Node js code to run the image analysis by rscript
*/

var push_array = [];
var count  ;
var i =0;
imageAnalysis();
const exec = require('child_process').exec;

function imageAnalysis() {
    try{
           storage.bucket(bucketName).getFiles().then(results => {
                var files = results[0];
                if(files.length>0){
                  var stream = fs.createWriteStream("config.txt");
                      stream.once('open', function(fd) {
                      stream.write("FALSE");
                      stream.end();

                      var arrayofdata = [];
                      const waitFor = (ms) => new Promise(r => setTimeout(r, ms))
                      const start = async () => {
                      await asyncForEach(files, async (num) => {
                        await waitFor(50)
                        arrayofdata.push(storage .bucket(bucketName).file(num.name).getMetadata());
                      })

                      var commands = [];   var promises = [];
                      var stdout = [];
                      Promise.all(arrayofdata).then(function(push_array) {
                        async.forEach(push_array, function(col, callback){
                          var metadata = col[0] ;
                          var base_link = imageUrl+metadata.name+"?alt=media";
                          var cmd = 'Rscript ex-sync.R '+base_link + " "+metadata.metadata.deviceID+ " "+metadata.name+ " "+metadata.metadata.sessionID;
                          //  var logr = execute(cmd);
                          //  promises.push(logr);
                          commands.push(cmd);
                         //  console.log("after execution "+logr);
                         });

                         /* Promise.all(promises).then(function(resultd) {
                           console.log("after all the promsies resolved");
                         }); */

                         console.log("commands "+commands.length);
                         runCommands(commands, function(err, jsonItems) {
                           var asyncTask = []; var asyncDelete = []; var asyncMoveNotDetected=[];var asyncMoveDetected=[];
                           var fcm = new FCM(serverKey);
                           async.forEach(jsonItems, function(data, callback){
                             console.log("R script response "+data);
                             var status = JSON.stringify(data).split(" ");
                              console.log(status);
                              if(status.length === 6){
                                  var finalStaus = status[1].split('\\')[0];
                                  var main_link = status[2].split('"')[1].split('\\')[0];
                                  var token = status[3].split('\\')[1].split("\"")[1];
                                  var filename = status[4].split('\\')[1].split("\"")[1];
                                  var sessionID = status[5].split('\\')[1].split("\"")[1];
                                  if (finalStaus.toLowerCase() ==="false") {
                                    var message = {
                                        to: token, // required fill with device token or topics
                                        priority : "high",
                                        collapse_key: 'your_collapse_key',
                                        data: {
                                            your_custom_data_key: 'your_custom_data_value',
                                            sessionID : sessionID
                                        }
                                     };
                                     asyncTask.push(fcm.send(message));
                                     asyncMoveNotDetected.push(storage.bucket(bucketName).file(filename).copy(storage.bucket(destinationBucket).file(filename)));
                                    // asyncDelete.push(storage.bucket(bucketName).file(filename).delete());
                                    asyncDelete.push(filename);
                                   }else {
                                     asyncMoveNotDetected.push(storage.bucket(bucketName).file(filename).copy(storage.bucket(destinationBreathDitectedBucket).file(filename)));
                                    // asyncDelete.push(storage.bucket(bucketName).file(filename).delete());
                                    asyncDelete.push(filename);
                                   }
                                }
                            });

                            Promise.all(asyncMoveNotDetected).then((moveRsultDnot) => {
                              console.log("all moved");
                              }).then(function(asyncTask){
                                console.log("all push sent");
                                  var asyncDeleteFiles = [];
                                  async.forEach(asyncDelete, function(filename, callback){
                                    asyncDeleteFiles.push(storage.bucket(bucketName).file(filename).delete());
                                  });
                                  Promise.all(asyncDeleteFiles).then((moveRsultDnot) => {
                                    console.log("all files deleted.");
                                    rewriteFile();
                                  }).catch(err => {
                                    console.error('ERROR:', err);
                                    rewriteFile();
                                  });;
                              }).catch(err => {
                                console.error('ERROR:', err);
                                rewriteFile();
                              });
                           });
                      }).catch(err => {
                        console.error('ERROR:', err);
                        rewriteFile();
                      });
                      console.log('Done');
                      console.log("data length "+arrayofdata.length);
                    }
                  start()
            });

         }else {
           console.log("no files found in the bucket ");
         }
        }).catch(err => {
          console.error('ERROR:', err);
          rewriteFile();
        });
    }
    catch(err){
          //do whatever with error
          console.log("catch block"+err);
          rewriteFile();
      }
}

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

/*
do call the r script with each items
*/
function callRscript(push_array){
 var  commands = [];
 console.log("calling r script");
 async.forEach(push_array, function(col, callback){
 var cmd = 'Rscript ex-sync.R '+col["link"] + " "+col["token"]+ " "+col["filename"]+ " "+col["sessionID"];
  commands.push(cmd);
  console.log(col["token"]);
});
console.log(commands);


runCommands(commands, function(err, jsonItems) {
  var asyncTask = []; var asyncDelete = []; var asyncMoveNotDetected=[];var asyncMoveDetected=[];
  async.forEach(jsonItems, function(data, callback){
    var status = JSON.stringify(data).split(" ");
     if(status){
      console.log(status);
         var finalStaus = status[1].split('\\')[0];
         var main_link = status[2].split('"')[1].split('\\')[0];
         var token = status[3].split('\\')[1].split("\"")[1];
         var filename = status[4].split('\\')[1].split("\"")[1];
         var sessionID = status[5].split('\\')[1].split("\"")[1];
         if (finalStaus.toLowerCase() ==="false") {
           var message = {
               to: token, // required fill with device token or topics
               priority : "high",
               collapse_key: 'your_collapse_key',
               data: {
                   your_custom_data_key: 'your_custom_data_value',
                   sessionID : sessionID
               }
            };
          asyncTask.push(fcm.send(message));
          asyncDelete.push(storage.bucket(bucketName).file(filename).delete());
          asyncMoveNotDetected.push(storage.bucket(bucketName).file(filename).copy(storage.bucket(destinationBucket).file(filename)));
        }else {
          asyncDelete.push(storage.bucket(bucketName).file(filename).delete());
          asyncMoveNotDetected.push(storage.bucket(bucketName).file(filename).copy(storage.bucket(destinationBreathDitectedBucket).file(filename)));
        }
      /*  if(filename){
           asyncDelete.push(storage.bucket(bucketName).file(filename).delete());
         }
         */
      }
   });

   Promise.all(asyncMoveNotDetected).then((deleteresultDnot) => {
         Promise.all(asyncDelete).then((deleteresult) => {
              console.log("removed buckets");
              //  empty the array
                push_array = [];
                console.log("final length "+push_array.length);
                var stream = fs.createWriteStream("config.txt");
                  stream.once('open', function(fd) {
                  stream.write("TRUE");
                  stream.end();
                  push_array = [];

                  Promise.all(asyncTask)
                            .then((result) => {
                                console.log(result);
                                console.log("sent message");
                                push_array = [];
                            })
                            .catch(err => {
                            console.log(err);
                           // push_array = [];
                            //rewriteFile();
                  });

                });
             })
             .catch(err => {
               console.log(err);
               push_array = [];
               rewriteFile();
             });
           })
         .catch(err => {
         console.log(err);
         push_array = [];
         rewriteFile();
       });

  console.log("finished all the jobs");
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


app.listen(8080, () => {
  console.log('App listening to port 8080');
});

var Promise = require('promise');
var fs = require('fs');
var rest = require('restler');
var request = require('request');
var ffmetadata = require('ffmetadata');

var program = require('commander');

program
  .version('0.0.1')
  .usage('[options] <trackUrl>')
  .option('-c, --client-id <clientId>', 'A Soundcloud API client ID')
  .parse(process.argv);


var filename;
var trackData;

var clientId = program.clientId;

if(!program.args || program.args.length < 1){
  console.error('No URL given');
  return -1;
}

var url = program.args[0];

if(!clientId){
  console.error('No client id given');
  return -1;
}

fetchTrack(url).then(function (data) {
  trackData = data;
  var streamUrl = data.stream_url + '?client_id=' + clientId;
  filename = [data.user.username, data.title].join(' - ') + '.mp3';
  return download(streamUrl, filename);
}).then(function () {
  return writeMetadata(filename, trackData);
}).then(function () {
  return writeArtwork(filename, trackData);
}).catch(function (error) {
  console.log('err > ' + error)
});

function writeMetadata(filename, trackData) {
  return new Promise(
    function (resolve, reject) {


      var data = {
        title: trackData.title,
        artist: trackData.user.username,
        year: trackData.created_at.substr(0, 4)
      };
      ffmetadata.write(filename, data, function (err) {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });

    }
  );
}

function writeArtwork(filename, trackData) {
  if(trackData.artwork_url) {
    var artworkUrl = trackData.artwork_url.replace('large', 't500x500');


    return download(artworkUrl, 'artworkUrl.jpg').then(function () {
      var options = {
        attachments: ["artworkUrl.jpg"]
      };
      return new Promise(function (resolve, reject) {
        ffmetadata.write(filename, {}, options, function (err) {
          fs.unlink("artworkUrl.jpg");
          if (err) return reject("Error writing cover art");
          return resolve();
        });
      });
    });
  }else{
    return Promise.resolve();
  }


}

function fetchTrack(trackURL) {
  return new Promise(function (resolve, reject) {
    rest.get('https://api.soundcloud.com/resolve', {
      'query': {
        'url': trackURL,
        'client_id': clientId
      },
      'parser': rest.parsers.json
    }).on('complete', function (data) {
      if (data.errors && data.errors.length > 0) {
        return reject(data.errors[0].error_message);
      }
      resolve(data);
    }).on('error', function (error) {
      reject(error);
    });
  });
}

function download(url, dest) {
  return new Promise(function (resolve, reject) {
    var fileStream = fs.createWriteStream(dest);
    fileStream.on('error', function (error) {
      reject(error);
    });
    request(url)
      .on('complete', function (event) {
        resolve();
      })
      .on('error', function (error) {
        reject(error)
      })
      .pipe(fileStream);
  });
}

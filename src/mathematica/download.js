const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

const BASE_PATH = `https://www.youtube.com/watch?v=`;
const SAVE_PATH = 'src/mathematica/image/'
const youtubeId = `gyDFoIbxB34`;
const url = BASE_PATH + youtubeId;

ytdl(url)
  .pipe(
    fs.createWriteStream(`${SAVE_PATH}${youtubeId}.mp4`)
      .on('close', _ => {
        ffmpeg(`${SAVE_PATH}${youtubeId}.mp4`)
          .screenshots({
            count: 100,
            folder: SAVE_PATH,
            filename: 'image-%i.png',
          })
        ;
      })
  )
;

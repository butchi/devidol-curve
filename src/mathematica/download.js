// const fs = require('fs');
// const ytdl = require('ytdl-core');
// const BASE_PATH = `https://www.youtube.com/watch?v=`;

const SAVE_PATH = 'src/mathematica/image/'

const youtubeId = `gyDFoIbxB34`;
// const url = BASE_PATH+youtubeId;

// ytdl(url).pipe(fs.createWriteStream(`${SAVE_PATH}${youtubeId}.mp4`));

const ffmpeg = require('fluent-ffmpeg');

const command = ffmpeg(`${SAVE_PATH}${youtubeId}.mp4`)
  .videoCodec('png')
  .fps(12)
  .output('image-%i.png')
  .run()
;
import fs = require("fs");
import request = require("request");

export function downImage(url: string, path: string) {
  return new Promise((resolve, reject) => {
    let file = fs.createWriteStream(path, {
      flags: 'w'
    });
    request.get({
      url: url
    }).on('response', response => {
      //console.debug(response)
    }).pipe(file)
      .on('finish', () => {
        resolve('ok');
      }).on('error', (e) => {
        reject(e);
      })
  });
}

export async function downPoster(url: string, path: string) {
  await downImage(url, `${path}\\Poster.jpg`)
};

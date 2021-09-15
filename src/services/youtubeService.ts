const { YTSearcher } = require('ytsearcher');
const ytdl = require("discord-ytdl-core");
const apikey = process.env.APIKEY;


const searcher = new YTSearcher(apikey);

export class YoutubeService {
  static async search(query) {
    console.log(query);
    return await searcher.search(query);
  }

  static getVideo(url) {
    return ytdl(url, {
      filter: "audioonly",
      fmt: "mp3",
      encoderArgs: ['-af', 'bass=g=10']
    });
  }

  static async getSongInfo(songString) {
    var songUrl = songString;
    if (!songString.startsWith("http") && !songString.startsWith("www")) {
      songUrl = (await YoutubeService.search(songString)).first.url;
    }
    const songInfo = await ytdl.getInfo(songUrl);
    return {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };
  }

  static async seekVideo(video) {
    video.seek()
  }
}
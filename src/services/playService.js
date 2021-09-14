"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var queueService_1 = require("./queueService");
var youtubeService_1 = require("./youtubeService");
var PlayService = /** @class */ (function () {
    function PlayService() {
    }
    PlayService.play = function (guild, song) {
        return __awaiter(this, void 0, void 0, function () {
            var dispatcher;
            return __generator(this, function (_a) {
                if (!song) {
                    queueService_1.QueueService.exit(guild.id);
                    return [2 /*return*/];
                }
                dispatcher = queueService_1.QueueService.playConnection(guild.id, youtubeService_1.YoutubeService.getVideo(song.url))
                    .on("finish", function () {
                    if (queueService_1.QueueService.loopAllIsEnabled(guild.id)) {
                        queueService_1.QueueService.addSong(guild.id, queueService_1.QueueService.getSong(guild.id));
                        queueService_1.QueueService.shiftSong(guild.id);
                    }
                    else if (!queueService_1.QueueService.loopOneIsEnabled(guild.id)) {
                        queueService_1.QueueService.shiftSong(guild.id);
                    }
                    PlayService.play(guild, queueService_1.QueueService.getSong(guild.id));
                })
                    .on("error", function (error) { return console.error(error); });
                dispatcher.setVolumeLogarithmic(queueService_1.QueueService.getVolume(guild.id) / 5);
                queueService_1.QueueService.sendMessage(guild.id, "Now playing: **" + song.title + "**");
                return [2 /*return*/];
            });
        });
    };
    PlayService.skip = function (message, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!message.member.voice.channel)
                    return [2 /*return*/, message.channel.send("You have to be in a voice channel to stop the music!")];
                if (!queueService_1.QueueService.hasQueue(id))
                    return [2 /*return*/, message.channel.send("There is no song that I could skip!")];
                queueService_1.QueueService.skip(id);
                return [2 /*return*/];
            });
        });
    };
    PlayService.stop = function (message, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!message.member.voice.channel)
                    return [2 /*return*/, message.channel.send("You have to be in a voice channel to stop the music!")];
                if (!queueService_1.QueueService.hasQueue(id))
                    return [2 /*return*/, message.channel.send("There is no song that I could stop!")];
                queueService_1.QueueService.stop(id);
                return [2 /*return*/];
            });
        });
    };
    PlayService.loop = function (message, id) {
        var command = message.content.split(" ")[1];
        switch (command) {
            case 'all':
                if (queueService_1.QueueService.switchLoopAll(id))
                    message.channel.send("Loop all has been turned on");
                else
                    message.channel.send("Loop all has been turned off");
                break;
            case 'one':
                if (queueService_1.QueueService.switchLoopOne(id))
                    message.channel.send("Loop one has been turned on");
                else
                    message.channel.send("Loop one has been turned off");
                break;
            case 'off':
                queueService_1.QueueService.turnLoopOff(id);
                message.channel.send("Loop has been turned off");
                break;
            default:
                message.channel.send("Please specify what loop you want. [one/all/off]");
        }
    };
    PlayService.queue = function (message, id) {
        var nowPlaying = queueService_1.QueueService.getSong(id);
        var qMSg = "Now Playing: " + nowPlaying.title + "\n ------------------------------------ \n";
        var songList = queueService_1.QueueService.getRemainingSongs(id);
        songList.forEach(function (song, i) {
            qMSg += i + 1 + ". " + song.title + "\n";
        });
        message.channel.send("```" + qMSg + "```");
    };
    return PlayService;
}());
exports["default"] = PlayService;
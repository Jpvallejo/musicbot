"use strict";
exports.__esModule = true;
exports.QueueService = void 0;
var queue = new Map();
var QueueService = /** @class */ (function () {
    function QueueService() {
    }
    QueueService.get = function (id) {
        var selectedQueue = queue.get(id);
        if (!selectedQueue)
            QueueService.createQueue(id);
        return queue.get(id);
    };
    QueueService.createQueue = function (id) {
        var newQueue = {
            textChannel: null,
            voiceChannel: null,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
            loopOne: false,
            loopAll: false
        };
        queue.set(id, newQueue);
    };
    QueueService.addSong = function (id, song) {
        var selectedQueue = QueueService.get(id);
        selectedQueue.songs.push(song);
    };
    QueueService.addConnection = function (id, connection) {
        var selectedQueue = QueueService.get(id);
        selectedQueue.connection = connection;
    };
    QueueService.getSong = function (id) {
        return QueueService.get(id).songs[0];
    };
    QueueService.hasQueue = function (id) {
        return !!queue.get(id);
    };
    QueueService.hasSongsQueue = function (id) {
        return this.hasQueue(id) && queue.get(id).songs.length > 0;
    };
    QueueService.skip = function (id) {
        QueueService.get(id).connection.dispatcher.end();
    };
    QueueService.clear = function (id) {
        var serverQueue = QueueService.get(id);
        serverQueue.songs = serverQueue.songs.splice(1);
    };
    QueueService.stop = function (id) {
        var serverQueue = QueueService.get(id);
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    };
    QueueService.playConnection = function (id, song) {
        var serverQueue = QueueService.get(id);
        serverQueue.currentSong = song;
        return serverQueue.connection
            .play(song);
    };
    QueueService.shiftSong = function (id) {
        QueueService.get(id).songs.shift();
    };
    QueueService.exit = function (id) {
        QueueService.get(id).voiceChannel.leave();
        queue["delete"](id);
    };
    QueueService.sendMessage = function (id, message) {
        QueueService.get(id).textChannel.send(message);
    };
    QueueService.getVolume = function (id) {
        return QueueService.get(id).volume;
    };
    QueueService.setChannels = function (id, textChannel, voiceChannel) {
        var serverQueue = QueueService.get(id);
        serverQueue.textChannel = textChannel;
        serverQueue.voiceChannel = voiceChannel;
    };
    QueueService.switchLoopAll = function (id) {
        var serverQueue = this.get(id);
        serverQueue.loopAll = !serverQueue.loopAll;
        serverQueue.loopOne = false;
        return serverQueue.loopAll;
    };
    QueueService.switchLoopOne = function (id) {
        var serverQueue = this.get(id);
        serverQueue.loopOne = !serverQueue.loopOne;
        serverQueue.loopAll = false;
        return serverQueue.loopOne;
    };
    QueueService.turnLoopOff = function (id) {
        var serverQueue = this.get(id);
        serverQueue.loopOne = false;
        serverQueue.loopAll = false;
    };
    QueueService.loopAllIsEnabled = function (id) {
        return this.get(id).loopAll;
    };
    QueueService.loopOneIsEnabled = function (id) {
        return this.get(id).loopOne;
    };
    QueueService.getRemainingSongs = function (id) {
        var serverQueue = this.get(id);
        return serverQueue.songs.slice(1, serverQueue.songs.length);
    };
    QueueService.getCurrentSong = function (id) {
        return this.get(id).currentSong;
    };
    return QueueService;
}());
exports.QueueService = QueueService;

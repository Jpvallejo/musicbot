const queue = new Map();
export class QueueService {
    static get(id) {
        const selectedQueue = queue.get(id);
        if (!selectedQueue) QueueService.createQueue(id);
        return queue.get(id);
    }

    static createQueue(id) {
        const newQueue = {
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
    }

    static addSong(id, song) {
        const selectedQueue = QueueService.get(id);
        selectedQueue.songs.push(song);
    }

    static addConnection(id, connection) {
        const selectedQueue = QueueService.get(id);
        selectedQueue.connection = connection;
    }

    static getSong(id) {
        return QueueService.get(id).songs[0];
    }

    static hasQueue(id) {
        return !!queue.get(id);
    }

    static hasSongsQueue(id) {
        return this.hasQueue(id) && queue.get(id).songs.length > 0;
    }
    static skip(id) {
        QueueService.get(id).connection.dispatcher.end();
    }

    static clear(id) {
        const serverQueue = QueueService.get(id);
        serverQueue.songs = serverQueue.songs.splice(1);
    }

    static stop(id) {
        const serverQueue = QueueService.get(id);
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }

    static playConnection(id, song) {
        return QueueService.get(id).connection
            .play(song);
    }

    static shiftSong(id) {
        QueueService.get(id).songs.shift();
    }

    static exit(id) {
        QueueService.get(id).voiceChannel.leave();
        queue.delete(id);
    }

    static sendMessage(id, message) {
        QueueService.get(id).textChannel.send(message);
    }

    static getVolume(id) {
        return QueueService.get(id).volume;
    }

    static setChannels(id, textChannel, voiceChannel) {
        const serverQueue = QueueService.get(id);
        serverQueue.textChannel = textChannel;
        serverQueue.voiceChannel = voiceChannel;
    }

    static switchLoopAll(id) {
        const serverQueue = this.get(id);
        serverQueue.loopAll = !serverQueue.loopAll;
        serverQueue.loopOne = false;
        return serverQueue.loopAll;
    }

    static switchLoopOne(id) {
        const serverQueue = this.get(id);
        serverQueue.loopOne = !serverQueue.loopOne;
        serverQueue.loopAll = false;
        return serverQueue.loopOne;
    }
    
    static turnLoopOff(id) {
        const serverQueue = this.get(id);
        serverQueue.loopOne = false;
        serverQueue.loopAll = false;
    }

    static loopAllIsEnabled(id) {
        return this.get(id).loopAll;
    }

    static loopOneIsEnabled(id) {
        return this.get(id).loopOne;
    }

    static getRemainingSongs(id) {
        const serverQueue = this.get(id);
        return serverQueue.songs.slice(1, serverQueue.songs.length);
    }
}
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');

const client = new Client({ authStrategy: new LocalAuth() });

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async message => {
    const msgBody = message.body.toLowerCase();

    // Command to create sticker from image/video
    if (msgBody.startsWith('!sticker')) {
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            // Send media as sticker
            await message.reply(media, null, { sendMediaAsSticker: true });
        } else {
            message.reply('Please send an image or video with the command !sticker');
        }
    }

    // Command to download song from YouTube
    if (msgBody.startsWith('!song')) {
        const args = message.body.split(' ');
        if (args.length < 2) {
            message.reply('Usage: !song <YouTube URL>');
            return;
        }
        const url = args[1];

        if (!ytdl.validateURL(url)) {
            message.reply('Invalid YouTube URL!');
            return;
        }

        const filename = `downloads/${Date.now()}.mp3`;
        fs.ensureDirSync('downloads');

        // Download audio
        ytdl(url, { filter: 'audioonly' })
            .pipe(fs.createWriteStream(filename))
            .on('finish', () => {
                // Send the downloaded song
                const media = MessageMedia.fromFilePath(filename);
                message.reply(media);
            })
            .on('error', (err) => {
                message.reply('Error downloading song.');
                console.error(err);
            });
    }
});

client.initialize();

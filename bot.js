require("dotenv").config();
const { readdirSync } = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

let lastSong = 0;
let localization = {
    NOTHING_PLAYING: "Nothing."
}
let songDirectory = "./songs/";
let songs = readdirSync(songDirectory).sort(() => Math.random() - 0.5);

client.on('ready', async () => {
    await defaultPresense();
    return console.log("❄ Christmas Radio Bot is running!");
});

client.on('message', async message => {
    if(message.author.bot) return;
    switch (message.content.toLowerCase()) {
        case "**play": {
            if (!message.member.voice.channel)
                return message.reply("You're not currently in a voice channel! ‼");

            await playSongs(await message.member.voice.channel.join());
            return message.reply("Now playing festive tunes! ⛄");
        }
        case "**stop": {
            if (!message.guild.me.voice.channel)
                return message.reply("You're not currently in a voice channel! ‼")

            message.guild.me.voice.channel.leave();
            await defaultPresense();
            return message.reply("Stopped the music! 🛑");
        }
        case "**skip": {
            if (!message.guild.me.voice.channel)
                return message.reply("You're not currently in a voice channel! ‼");

            lastSong++;
            if (lastSong == songs.length) lastSong = 0;
            await playSongs(await message.member.voice.channel.join());
            return message.reply("Skipped current song! ⏩");
        }
        case "**help": {
            return message.reply(":christmas_tree:  **Christmas Radio Commands**\n\n`**play` - Join your voice channel and play tunes.\n`**stop` - Leave your voice channel.\n`**skip` - Skip the current song.\n`**help` - View this message.\n\nDeveloped by Max (335278932817346570).");
        }
    }
});

async function playSongs(connection) {
    if (connection.channel.members.size <= 1) {
        await connection.channel.leave();
        return await defaultPresense();
    }

    const dispatcher = await connection.play(songDirectory + songs[lastSong]);
    client.user.setPresence({
        activity: {
            name: songs[lastSong].replace(/.\s*$/, ""),
            type: "PLAYING"
        },
        status: "ONLINE"
    }).catch(err => console.log(err));

    await dispatcher.on('finish', async () => {
        lastSong++;
        if (lastSong == songs.length) lastSong = 0;
        await playSongs(connection);
    });
}

async function defaultPresense() {
    client.user.setPresence({
        activity: {
            name: localization.NOTHING_PLAYING,
            type: "PLAYING"
        },
        status: "ONLINE"
    }).catch(err => console.log(err));
}

client.login(process.env.BOT_TOKEN);
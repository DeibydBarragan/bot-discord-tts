const secret = require('./secret.json'); //file with your bot credentials/token/etc
const discordTTS=require("discord-tts");
const {Client, Intents} = require("discord.js");
const {AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel} = require("@discordjs/voice");

const intents=
[
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS
];

const client = new Client({intents:intents});
client.login(secret.token);

client.on("ready", () => console.log("Online"));

let voiceConnection;
let audioPlayer=new AudioPlayer();

client.on("messageCreate", async (msg)=>{
    const msgArr = msg.content.split(" ");
    if(msgArr[0]===".t")
    {
        const message = msgArr[1] === "slow" ? msgArr.slice(2).join(" ") : msgArr.slice(1).join(" ");
        const stream=discordTTS.getVoiceStream(message, {lang:"es", slow: msgArr[1] === "slow" ? true : false});
        const audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
        if(!voiceConnection || voiceConnection?.status===VoiceConnectionStatus.Disconnected){
            voiceConnection = joinVoiceChannel({
                channelId: msg.member.voice.channelId,
                guildId: msg.guildId,
                adapterCreator: msg.guild.voiceAdapterCreator,
            });
            voiceConnection=await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
        }
        
        if(voiceConnection.status===VoiceConnectionStatus.Connected){
            voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }
    }
    if(msgArr[0]===".s")
    {
        audioPlayer.stop();
    }
});
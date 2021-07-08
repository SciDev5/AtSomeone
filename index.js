import Discord from "discord.js";

const client = new Discord.Client();

const NICK = "someone";

client.on("guildCreate", async guild => {
    try {
        await guild.members.resolve(client.user.id).setNickname(NICK);
    } catch (e) {
        console.error("Couldn't Set Nickname:");
        console.error(e);
    }
});
client.on("guildMemberUpdate", async (_,member) => {
    if (member.id === client.user.id && member.nickname !== NICK)
        await member.setNickname(NICK);
});

client.on("message",async message => {
    if (message.author.id === client.user.id) return;

    console.log("Message [by: %s]: %s",message.author.tag,message.content);
    if (message.mentions.users.find((_user,id) => id === client.user.id)) {
        console.log("'@someone' Mentioned, Forwarding...");
        var members = (message.guild.members.cache || await message.guild.members.fetch()).filter(v => v.id !== message.author.id && v.id !== client.user.id);
        await message.channel.send(`[From <@!${message.author.id}>] `+message.content.replace(new RegExp(`<@!${client.user.id}>`,"g"),()=>`<@!${members.random().id}>`));
    }
    if (message.content.startsWith("^s")) {
        client.destroy();
        console.log("Logged Out, Bot Destroyed.");
    }
});


client.login(process.env.BOT_TOKEN).then(()=>console.log("Started Bot")).catch(e=>{throw e});
// @ts-check

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

    try {
        console.log("Message [by: %s]: %s",message.author.tag,message.content);
        if (message.mentions.users.find((_user,id) => id === client.user.id)) {
            console.log("'@someone' Mentioned, Forwarding...");
            var members = (message.guild.members.cache || await message.guild.members.fetch({time:5000})).filter(v => v.id !== message.author.id && v.id !== client.user.id);
            var responseText = `[From <@!${message.author.id}>] `+message.content.replace(new RegExp(`<@!${client.user.id}>`,"g"),()=>`<@!${members.random().id}>`);
            if (responseText.length < 2000) await message.channel.send(responseText);
            else await message.reply("Could not @someone, resultant message was too long.");
        } else if (message.content.startsWith("^s")) {
            client.destroy();
            console.log("Logged Out, Bot Destroyed.");
        } else if (message.content.startsWith("^m")) {
            await message.reply("Fetching members...");
            var members = (await message.guild.members.fetch({time:5000}));
            /**@type {Discord.GuildMember[]}*/var membersArr = []; for (let member of members.values()) membersArr.push(member);
            await message.reply("List of members: \n"+membersArr.map(v=>`- **${v.user.tag}** "${v.nickname}"`).join("\n"));    
        }
    } catch (e) {
        await message.reply("**Failed**:\n```"+e.stack+"```");
        console.error(e);
    }
});


client.login(process.env.BOT_TOKEN).then(()=>console.log("Started Bot")).catch(e=>{throw e});
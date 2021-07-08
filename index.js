// @ts-check

import Discord from "discord.js";

const client = new Discord.Client();

const NICK = "someone", CMD_PREFIX = "raw:";

/**@type {Discord.ClientApplication}*/ var application;
client.once("ready",async ()=>{
    application = await client.fetchApplication();
});

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

const DEBUG_MODE = process.env.DEBUG === "TRUE";
client.on("message",async message => {
    if (message.author.id === client.user.id) return;

    const {guild, author, content, channel} = message;
    try {
        if (message.mentions.users.find((_user,id) => id === client.user.id)) {
            if (DEBUG_MODE) console.log("'@someone' Mentioned, Forwarding...");
            let members = (await guild.members.fetch({time:5000})).filter(v => v.id !== author.id && v.id !== client.user.id);
            let responseText = content.replace(new RegExp(`<@!${client.user.id}>`,"g"),()=>`<@!${members.random().id}>`);
            if (content.trim().startsWith(CMD_PREFIX))
                responseText = responseText.trimStart().substr(CMD_PREFIX.length);
            else responseText = `[From <@!${author.id}>] ${responseText}`;
            if (responseText.length < 2000) await channel.send(responseText);
            else await message.reply("Could not @someone, resultant message was too long.");
        }
        if (DEBUG_MODE) {
            console.log("Message [by: %s]: %s",author.tag,content);
            
            let beginningRoleMarker = content.match(/^ *<@&(.*?)>/);
            const role = beginningRoleMarker&&guild.roles.resolve(beginningRoleMarker[1]);
            if (role && role.managed && role.members.first().id === client.user.id) {
                const command = content.trim().substr(role.id.length+4).trim();
                console.log("Received Command: "+command);
                if (/^s(?:top)?$/.test(command)) {
                    await message.reply("Stopping bot.");
                    client.destroy();
                    console.log("Logged Out, Bot Destroyed.");
                } else if (/^m(?:embers?)?$/.test(command)) {
                    await message.reply("Fetching members...");
                    let members = (await guild.members.fetch({time:5000})).array();
                    await message.reply("List of members: \n"+members.map(v=>`- **${v.user.tag}** "${v.nickname}"`).join("\n"));    
                }
            }
        }
    } catch (e) {
        await message.reply("**Failed**:\n```"+e.stack+"```");
        console.error(e);
    }
});


client.login(process.env.BOT_TOKEN).then(()=>console.log("Started Bot")).catch(e=>{throw e});
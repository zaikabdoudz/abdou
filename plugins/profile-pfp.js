let handler = async (m, { conn }) => {
let mentionedJid = await m.mentionedJid
let who = await m.quoted?.sender || mentionedJid?.[0]
if (!who) return conn.sendMessage(m.chat, { text: '*❀ لاستعمال الامر قم بالرد على شخص او منشنه*.' }, { quoted: m })
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://raw.githubusercontent.com/speed3xz/Storage/refs/heads/main/Arlette-Bot/b75b29441bbd967deda4365441497221.jpg')
await m.react('🕒')
await conn.sendFile(m.chat, pp, 'profile.jpg', `❀ *Picture here  ${name}*`, m)
await m.react('✔️')
}

handler.help = ['pfp']
handler.tags = ['sticker']
handler.command = ['pfp', 'بروفايل']

export default handler

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname2 = path.dirname(fileURLToPath(import.meta.url))
const getBotsFromFolder = (folderName) => {
  const basePath = path.join(__dirname2, '../../Sessions', folderName)
  if (!fs.existsSync(basePath)) return []
  return fs.readdirSync(basePath).filter(dir => fs.existsSync(path.join(basePath, dir, 'creds.json'))).map(id => id.replace(/\D/g, '') + '@s.whatsapp.net')
}

const handler = async (m, { conn, chat }) => {
  try {
    const who = m.mentionedJid?.[0] || m.quoted?.sender || false
    if (!who) return conn.reply(m.chat, `《✧》 منشن البوت الذي تريد تعيينه كبوت رئيسي.`, m)
    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => ({}))
    const groupParticipants = groupMetadata?.participants?.map(p => p.phoneNumber || p.jid || p.id) || []
    const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const allowedBots = [...new Set([...getBotsFromFolder('Subs'), mainBotJid])]
    if (!allowedBots.includes(who)) return conn.reply(m.chat, `《✧》 المستخدم المذكور ليس بوتاً فرعياً.`, m)
    if (!groupParticipants.includes(who)) return conn.reply(m.chat, `《✧》 البوت المذكور غير موجود في المجموعة.`, m)
    if (chat.primaryBot === who) return conn.reply(m.chat, `「✿」 @${who.split('@')[0]} هو البوت الرئيسي بالفعل.`, m, { mentions: [who] })
    chat.primaryBot = who
    await conn.reply(m.chat, `ꕥ تم تعيين @${who.split('@')[0]} كبوت رئيسي لهذه المجموعة.`, m, { mentions: [who] })
  } catch (e) {
    await m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['بوت_رئيسي @منشن']
handler.tags = ['group']
handler.command = /^(بوت_رئيسي|setprimary)$/i
handler.admin = true
handler.group = true
export default handler
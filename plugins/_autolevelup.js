import db from '../lib/database.js'
import { canLevelUp } from '../lib/levelling.js'

// تعريف متغيرات افتراضية للصور والروابط
const imageUrl = { getRandom: () => 'https://i.ibb.co/2P9vM6M/default.jpg' }
const img = { getRandom: () => 'https://i.ibb.co/2P9vM6M/default.jpg' }
const redes = { getRandom: () => 'https://example.com' }

export async function before(m, { conn }) {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let ppch = await conn.profilePictureUrl(who, 'image').catch(_ => imageUrl.getRandom()) 
  let user = global.db.data.users[m.sender]
  let chat = global.db.data.chats[m.chat]

  if (!chat?.autolevelup) return true

  let beforeLevel = user.level
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
  user.role = global.rpg.role(user.level).name

  if (beforeLevel !== user.level) {
    const messages = [
      `*❍━━━══━━❪🌸❫━━══━━━❍*\n「✨ مبروك على المستوى الجديد 🆙🎉 」\n*❍━━━══━━❪🌸❫━━══━━━❍*\nمبروك، لقد وصلت إلى مستوى جديد، استمر على هذا النحو! 💪\n\n*• المستوى:* ${beforeLevel} ⟿ ${user.level}\n*• الرتبة:* ${user.role}\n\n_*لرؤية نقاطك بشكل مباشر، استخدم الأمر #level*_\n*❍━━━══━━❪🌸❫━━══━━━❍*`,
      `@${m.sender.split`@`[0]} واو، لقد وصلت إلى مستوى جديد! 👏\n*• المستوى:* ${beforeLevel} ⟿ ${user.level}\n\n_*لرؤية ترتيب اللاعبين، استخدم الأمر #lb*_\n*❍━━━══━━❪🌸❫━━══━━━❍*`,
      `ما شاء الله @${m.sender.split`@`[0]}، لقد حققت إنجازًا كبيرًا! 🙌\n\n*• المستوى الجديد:* ${user.level}\n*• المستوى السابق:* ${beforeLevel}\n*❍━━━══━━❪🌸❫━━══━━━❍*`
    ]

    await conn.reply(m.chat, messages[Math.floor(Math.random() * messages.length)], m, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: 'https://files.catbox.moe/rldpy4.jpg',
          mediaType: 1,
          description: 'ιтαcнι вσт',
          title: '𝙰𝚁𝚃_𝙱𝙾𝚃',
          body: '💖 بوت فائق لواتساب 🥳',
          thumbnail: img.getRandom(),
          sourceUrl: redes.getRandom()
        }
      }
    })

    const niv = `🥳 *${m.pushName || 'مجهول'}* حصل على مستوى جديد! 🎉\n\n*• المستوى السابق:* ${beforeLevel}\n*• المستوى الحالي:* ${user.level}\n*• الرتبة:* ${user.role}\n*• بوت:* ιтαcнι вσт`
    const nivell = `🥳 *${m.pushName || 'مجهول'}* ارتفع إلى مستوى جديد! 🆙\n\n> _*• المستوى:* ${beforeLevel} ⟿ ${user.level}_`
    const nivelll = `🥳 ${m.pushName || 'مجهول'} أحرزت تقدمًا، وصلت إلى مستوى جديد! 💥\n\n*• المستوى:* ${beforeLevel} ⟿ ${user.level}\n*• الرتبة:* ${user.role}\n*• بوت:* ιтαcнι вσт`
    
    // إرسال إشعار عام (تأكد أن global.ch.ch1 معرف)
    if (global.conn && global.ch?.ch1) {
      await global.conn.sendMessage(global.ch.ch1, { text: [niv, nivell, nivelll][Math.floor(Math.random() * 3)], contextInfo: {
        externalAdReply: {
          title: "【 🔔 إشعار عام 🔔 】",
          body: 'لقد وصلت إلى مستوى جديد! 🎉',
          thumbnailUrl: ppch,
          sourceUrl: redes.getRandom(),
          mediaType: 1,
          showAdAttribution: false,
          renderLargerThumbnail: false
        }
      }})
    }
  }
}

// نظام RPG للرتب
global.rpg = {
  emoticon(string) {
    string = string.toLowerCase()
    let emot = { role: '🏅', level: '⬆️' }
    let results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string))
    if (!results.length) return ''
    return emot[results[0][0]]
  },
  role(level) {
    level = parseInt(level)
    if (isNaN(level)) return { name: '', level: '' }
    const roles = [
      { name: 'مبتدئ V', level: 0 },
      { name: 'مبتدئ IV', level: 4 },
      { name: 'مبتدئ III', level: 8 },
      { name: 'مبتدئ II', level: 12 },
      { name: 'مبتدئ I', level: 16 },
      { name: 'متعلم V', level: 20 },
      { name: 'متعلم IV', level: 24 },
      { name: 'متعلم III', level: 28 },
      { name: 'متعلم II', level: 32 },
      { name: 'متعلم I', level: 36 },
    ]
    return roles.find(r => level >= r.level) || { name: 'لا رتبة', level: level }
  }
}
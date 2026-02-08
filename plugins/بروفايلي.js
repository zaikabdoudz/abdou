import { xpRange } from '../lib/levelling.js'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

function isPremium(userId) {
  return global.prems.includes(userId.split`@`[0])
}

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  let who = m.mentionedJid?.[0] || m.sender
  let user = global.db.data.users[who]
  if (!user) return m.reply('⚠️ المستخدم غير موجود في قاعدة البيانات!')

  let { level, exp, role, name, registered, age } = user
  let { min, xp, max } = xpRange(level, global.multiplier)
  let prem = isPremium(who)
  let xpToLevelUp = max - exp

  // حساب نسبة التقدم
  let progress = Math.floor(((exp - min) / (max - min)) * 100)
  if (progress < 0) progress = 0
  if (progress > 100) progress = 100
  let filledBar = Math.floor(progress / 10)
  let bar = '▰'.repeat(filledBar) + '▱'.repeat(10 - filledBar)

  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://qu.ax/fNyJg.jpg')
  let img = await (await fetch(pp)).buffer()

  let now = new Date()
  let locale = 'ar'
  let week = now.toLocaleDateString(locale, { weekday: 'long' })
  let date = now.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let time = now.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })

  let txt = `
*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*
*𝙰𝚁𝚃_𝙱𝙾𝚃*
*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*
*╮ ⊰✫⊱─⊰✫⊱─⊰✫⊱╭*

⚡ *الاسم:* ${name}
⚡ *العمر:* ${registered ? `${age} *سنة*` : 'غير مسجل'}
⚡ *الرقم:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
⚡ *المستوى:* ${level}
⚡ *الخبرة:* ${exp} / ${max}
⚡ *شريط المستوى:* ${bar} ${progress}%
⚡ *المتبقي للترقية:* ${xpToLevelUp}
⚡ *بريميوم:* ${prem ? 'نعم ✅' : 'لا ❌'}
⚡ *الرتبة:* ${role}
⚡ *اليوم:* ${week}
⚡ *التاريخ:* ${date}
⚡ *الوقت:* ${time}

*┘⊰✫⊱─⊰✫⊱─⊰✫⊱└*
`.trim()

  await conn.sendMessage(m.chat, {
    image: img,
    caption: txt,
    footer: '𝙰𝚁𝚃_𝙱𝙾𝚃',
    buttons: [
      { buttonId: `.اوامر`, buttonText: { displayText: '⚡ الأوامر' } },
      { buttonId: `.المطور`, buttonText: { displayText: '🩸 المطور' } }
    ],
    viewOnce: true
  }, { quoted: m })
}

handler.help = ['بروفايل']
handler.tags = ['start']
handler.command = /^(بروفايل|برفايلي|perfil|profile|بروف|بروفايلي)$/i

export default handler
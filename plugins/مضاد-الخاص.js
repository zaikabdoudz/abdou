// ===[ مضاد الخاص – النسخة الملكية – شغال مع التفعيلات ]===
// ملف: plugins/antiprivate.js
// يشتغل مع: .فتح مضاد_الخاص   |   .قفل مضاد_الخاص

export async function before(m, { conn }) {
  if (m.isGroup || m.fromMe || m.isBaileys) return true

  const bot = global.db.data.settings?.[conn.user.jid] || {}
  if (!bot.antiPrivate) return true

  // المطورين المستثنين
  const developers = ['213540419314', '213774297599']
  const sender = m.sender.replace(/[^0-9]/g, '')
  if (developers.includes(sender)) return true

  try {
    const warnText = `
❍━═━═━═━═━═━═━❍
❍⇇ ممنوع الكلام في الخاص
❍
❍⇇ تم حظرك تلقائيًا
❍⇇ مضاد الخاص مفعّل
❍
❍⇇ للتواصل مع المطور:
wa.me/213540419314
❍
❍⇇ مجموعة البوت الرسمية:
https://chat.whatsapp.com/CvWNDXXjw1J8K7y92bPycz
❍━═━═━═━═━═━═━❍
    `.trim()

    await conn.sendMessage(m.chat, { text: warnText }, { quoted: m })

    // حظر المستخدم
    try { await conn.updateBlockStatus(m.sender, 'block') }
    catch {
      try { await conn.updateBlockStatus(m.sender, true) }
      catch {}
    }

    // إشعار للأونر
    const ownerJid = global.owner?.[0]?.[0] ? global.owner[0][0] + '@s.whatsapp.net' : conn.user.jid
    await conn.sendMessage(ownerJid, {
      text: `تم حظر شخص من الخاص\nالرقم: wa.me/${sender}`
    }).catch(() => {})

  } catch (err) {
    console.error('خطأ في مضاد الخاص:', err)
  }

  return true
}
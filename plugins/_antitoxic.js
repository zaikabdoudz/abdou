// ===[ مضاد الشتائم – النسخة الجبارة – طرد بعد 3 تحذيرات فقط ]===
// ملف: plugins/antitoxic.js
// يشتغل مع: .فتح مضاد_الشتائم  |  .قفل مضاد_الشتائم

import axios from 'axios'

const TOXIC_WORDS = /(كسمك|كس|زب|نيك|متناك|خول|شرموطه|لبوه|عرص|قحبة|منيوك|زبي|طيز|كساسك|كسختك|كس امك|زب امك|شرموط|قحبه|منيك|يا ابن الشرموطة|يا ابن القحبة|يا عاهرة|يا لبوة|يا عرصة|يا ابن الحرام|يا ولد الزنا|كسخت|زبك في|طيزك|مني|لبنك|كساس|قواد|مأبون|خرا عليك|خرا على|منيك امك|نيج امك|شرموطة امك|قحبة امك|خول امك)/i

export async function before(m, { conn, isAdmin = false, isBotAdmin = false }) {
  try {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return true

    // ضمان وجود بنية الـ DB
    if (!global.db) global.db = { data: { users: {}, chats: {}, settings: {} }, write: global.db?.write }
    if (!global.db.data) global.db.data = { users: {}, chats: {}, settings: {} }
    if (!global.db.data.users) global.db.data.users = {}

    const chat = global.db.data.chats?.[m.chat] || {}
    if (!chat.antiToxic) return true

    const text = (
      m.text ||
      m.caption ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      ''
    ).toString()

    if (!text) return true

    if (TOXIC_WORDS.test(text)) {
      // تهيئة التحذيرات للمستخدم إن لم تكن موجودة
      if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
      const user = global.db.data.users[m.sender]

      user.warn = (user.warn || 0) + 1

      // حذف الرسالة (إن كانت الواجهة تدعم ذلك)
      try {
        if (typeof conn.sendMessage === 'function') {
          await conn.sendMessage(m.chat, {
            delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.sender }
          }).catch(()=>{})
        }
      } catch (e) {}

      const warnCount = user.warn

      const warning = `
❍━═━═━═━═━═━═━❍
❍⇇ تم اكتشاف شتيمة
❍
❍⇇ العضو ↜ @${m.sender.split('@')[0]}
❍⇇ التحذير ↜ ${warnCount}/3
${warnCount >= 3 ? '❍⇇ تم الطرد تلقائيًا' : '❍⇇ احترم الجروب'}
❍━═━═━═━═━═━═━❍
      `.trim()

      try {
        await conn.sendMessage(m.chat, {
          text: warning,
          mentions: [m.sender]
        }, { quoted: m })
      } catch (e) {
        // تجاهل أخطاء الإرسال
      }

      // طرد بعد 3 تحذيرات (إذا البوت أدمن ومُرسل غير أدمن)
      if (warnCount >= 3 && isBotAdmin && !isAdmin) {
        try {
          if (typeof conn.groupParticipantsUpdate === 'function') {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            await conn.sendMessage(m.chat, {
              text: 'تم طرد العضو نهائيًا بسبب الشتائم المتكررة'
            }).catch(()=>{})
            user.warn = 0 // تصفير بعد الطرد
          } else {
            // إذا الواجهة لا تدعم الطرد، نعلّم المشرفين فقط
            await conn.sendMessage(m.chat, {
              text: 'اكتشف نظام مضاد_الشتائم: العضو وصل 3 تحذيرات لكن الواجهة لا تدعم الطرد التلقائي.'
            }).catch(()=>{})
          }
        } catch (e) {
          console.log('فشل الطرد:', e?.message || e)
        }
      }
    }

    return true
  } catch (err) {
    console.error('antitoxic before error:', err)
    return true
  }
}
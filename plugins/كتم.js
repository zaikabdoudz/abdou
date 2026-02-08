// ===[ Mute System 2026 – كتم دائم فقط – أقوى وأنظف ]===
// ملف: plugins/mute.js
// أوامر:
// .كتم @منشن  → كتم دائم
// .فككتم @منشن

import fs from 'fs'
import path from 'path'

const MUTES_FILE = path.join(process.cwd(), 'database', 'mutes.json')

// تحميل + حفظ (بنية بسيطة: { "<jid>": { muted: true } })
function loadMutes() {
  try {
    if (!fs.existsSync(MUTES_FILE)) {
      fs.mkdirSync(path.dirname(MUTES_FILE), { recursive: true })
      fs.writeFileSync(MUTES_FILE, JSON.stringify({}, null, 2))
      return {}
    }
    return JSON.parse(fs.readFileSync(MUTES_FILE, 'utf8') || '{}')
  } catch (e) {
    console.error('خطأ تحميل الكتم:', e)
    return {}
  }
}

function saveMutes(data) {
  try {
    fs.mkdirSync(path.dirname(MUTES_FILE), { recursive: true })
    fs.writeFileSync(MUTES_FILE, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('خطأ حفظ الكتم:', e)
  }
}

// تنظيف الـ jid
function cleanJid(jid) {
  if (!jid) return null
  if (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net')) return jid
  if (/^\d+$/.test(jid)) return jid + '@s.whatsapp.net'
  return jid
}

// تهيئة DB عامة لو مش موجودة
if (!global.db) global.db = { data: { users: {} } }
if (!global.db.data) global.db.data = { users: {} }
if (!global.db.data.users) global.db.data.users = {}

const saved = loadMutes()
for (const jid in saved) {
  if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
  global.db.data.users[jid].muted = !!saved[jid].muted
}

// نحفظ فقط المستخدمين المكتومين (بنية بسيطة)
function saveAll() {
  const data = {}
  for (const jid in global.db.data.users) {
    const u = global.db.data.users[jid]
    if (u && u.muted) data[jid] = { muted: true }
  }
  saveMutes(data)
}

// =================== الأوامر ===================
export default {
  help: ['كتم', 'فككتم'],
  tags: ['group'],
  command: /^(كتم|فككتم|فك-كتم|unmute)$/i,
  group: true,
  admin: true,
  botAdmin: true,

  async handler(m, { conn, text, usedPrefix, command }) {
    if (!m.isGroup) return m.reply('الأمر للجروبات فقط')

    let who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
    if (!who && text) who = text.split(' ')[0]
    if (!who) return m.reply(`منشن الشخص أو ارده\nمثال: ${usedPrefix}كتم @منشن`)

    who = cleanJid(who)
    const owner = global.owner?.[0]?.[0] ? global.owner[0][0] + '@s.whatsapp.net' : null
    const bot = conn.user.jid

    if (who === owner) return m.reply('ما أقدر أكتم الأونر')
    if (who === bot) return m.reply('ما أقدر أكتم نفسي')

    if (!global.db.data.users[who]) global.db.data.users[who] = { muted: false }

    const user = global.db.data.users[who]

    // فك الكتم
    if (/^فككتم|فك-كتم|unmute$/i.test(command)) {
      if (!user.muted) return m.reply('هذا الشخص مو مكتوم')

      user.muted = false
      saveAll()

      await m.reply(`
✅ تم فك كتم العضو

الشخص: @${who.split('@')[0]}
المشرف: @${m.sender.split('@')[0]}
      `.trim(), { mentions: [who, m.sender] })

      return
    }

    // كتم دائم
    if (command === 'كتم') {
      if (user.muted) return m.reply('هذا الشخص مكتوم من قبل')

      // نتجاهل أي وسيط وقتي يُعطى ونطبّق كتم دائم
      user.muted = true
      saveAll()

      await conn.sendMessage(m.chat, {
        text: `
✅ تم كتم العضو (دائم)

الشخص: @${who.split('@')[0]}
المشرف: @${m.sender.split('@')[0]}
        `.trim(),
        mentions: [who, m.sender]
      }, { quoted: m })
    }
  },

  // فلتر حذف الرسائل (الكتم الدائم فقط)
  async before(m, { conn }) {
    if (!m.isGroup || !m.key || m.fromMe || m.isBaileys) return true

    const sender = cleanJid(m.sender)
    if (!sender) return true

    const user = global.db.data.users[sender]
    if (!user || !user.muted) return true

    // حذف رسالة المكتوم (لن يكون هناك فك تلقائي — كتم دائم)
    try {
      if (typeof conn.sendMessage === 'function') {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: sender
          }
        }).catch(() => {})
      }
    } catch (e) {
      console.log('فشل حذف رسالة المكتوم:', e)
    }

    // نمنع استمرار معالجة الرسالة بواسطة باقي الهاندلرز
    return true
  }
}
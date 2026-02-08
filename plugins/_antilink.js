// ===[ مضاد الروابط - قبل الرسائل - 5 تحذيرات ثم طرد ]===
// ملف: plugins/antilink-before.js
// شكل: export async function before(m, { conn }) { ... }  (مطابق antiprivate)

export async function before(m, { conn }) {
  try {
    // نعمل فقط داخل الجروبات
    if (!m.isGroup) return true

    // نص الرسالة / الكابشن للتحقق من الروابط
    const text = m.originalText || m.text || m.caption || ''
    if (!text) return true

    // تأكد من وجود قاعدة البيانات وتهيئتها
    if (!global.db || !global.db.data) return true
    global.db.data.chats = global.db.data.chats || {}
    const chatObj = global.db.data.chats[m.chat] ||= {}

    // إذا الخاصية غير مفعّلة في هذه المجموعة -> لا نفعل شيئًا
    if (!chatObj.antiLink) return true

    // استثناءات: مطورين (أرقام بدون بادئة) — احتفظت برقمك 213774297599 كما طلبت سابقًا
    const developers = ['213774297599', '213540419314']
    const senderNumOnly = (m.sender || '').replace(/[^0-9]/g, '')
    if (developers.includes(senderNumOnly)) return true

    // لا نعاقب الأدمن/المالك أو رسائل المالك/البوت
    if (m.fromMe) return true

    // نمط شامل لكل أنواع الروابط الممكنة
    const links = /https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/\d+|chat\.whatsapp\.com\/[A-Za-z0-9_-]+|t\.me\/[^\s]+|instagram\.com\/[^\s]+|facebook\.com\/[^\s]+|youtube\.com\/[^\s]+|youtu\.be\/[^\s]+|x\.com\/[^\s]+|twitter\.com\/[^\s]+|discord\.gg\/[^\s]+|tiktok\.com\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|cutt\.ly\/[^\s]+|is\.gd\/[^\s]+|v\.gd\/[^\s]+|prettylink\.pro\/[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/i

    if (!links.test(text)) return true

    // جلب بيانات المجموعة للتحقق من صلاحيات البوت والمرسل
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata || !Array.isArray(metadata.participants)) {
      // لو ما قدرنا نجيب الميتاداتا نكتفي بتحذير
      try {
        await conn.sendMessage(m.chat, { text: `⚠️ تم اكتشاف رابط من @${m.sender.split('@')[0]} لكن لا أستطيع التحقق من صلاحياتي.`, mentions: [m.sender] }, { quoted: m })
      } catch {}
      return true
    }

    const normalizeId = id => (id || '').toString().replace(/:\d+/, '')
    const botId = normalizeId(conn.user?.id || conn.user?.jid || '')
    const senderId = normalizeId(m.sender || '')
    const senderLid = normalizeId(m.lid || '')

    // هل البوت أدمن؟
    const isBotAdmin = metadata.participants.some(p => {
      const pid = normalizeId(p.id)
      return (pid === botId || pid === (conn.user?.lid || '').replace(/:\d+/, '')) && (p.admin || p.isAdmin || p.isSuperAdmin)
    })

    // هل المرسل أدمن؟ (استثناء)
    const isSenderAdmin = metadata.participants.some(p => {
      const pid = normalizeId(p.id)
      return pid === senderId || (senderLid && pid === senderLid) ? (p.admin || p.isAdmin || p.isSuperAdmin) : false
    })

    if (isSenderAdmin) return true // لا نطبق على الأدمن

    // تهيئة عدّ التحذيرات في DB
    chatObj.antilinkWarns = chatObj.antilinkWarns || {}
    const warns = chatObj.antilinkWarns
    const current = warns[m.sender] || 0
    const next = current + 1
    warns[m.sender] = next

    // نحاول كتابتها للـ DB إن كانت دالة الحفظ متاحة
    try { if (typeof global.db.write === 'function') global.db.write() } catch (e) {}

    const MAX_WARNS = 5
    // إذا لم نكن أدمنين: نبلّغ فقط ونوقف هنا (لكن نحتفظ بالتحذير)
    if (!isBotAdmin) {
      try {
        await conn.sendMessage(m.chat, { text: `*「 ANTILINK 」*\n\n@${m.sender.split('@')[0]}، تم اكتشاف رابط. (تحذير ${next}/${MAX_WARNS})\nلكنني لست أدمنًا لحذف أو طرد.`, mentions: [m.sender] }, { quoted: m })
      } catch {}
      return true
    }

    // نحذف الرسالة إن أمكن
    try {
      if (m.key) {
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant || m.sender } })
      }
    } catch (e) {
      // تجاهل فشل الحذف، لكن الاستمرار في العد
    }

    // إذا وصل للحد: نحاول طرد العضو وإعادة ضبط تحذيراته
    if (next >= MAX_WARNS) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        // إعلام المجموعة بنجاح الطرد
        const kickedMsg = `
❍━═━═━═━═━═━═━❍
❍⇇ تم طرد عضو لكسره قواعد المجموعة
❍
❍⇇ العضو ↜ @${m.sender.split('@')[0]}
❍⇇ السبب ↜ نشر روابط بعد ${MAX_WARNS} تحذيرات
❍━═━═━═━═━═━═━❍
        `.trim()
        await conn.sendMessage(m.chat, { text: kickedMsg, mentions: [m.sender] }).catch(() => {})
      } catch (err) {
        // فشل الطرد؟ نعلم المجموعة
        await conn.sendMessage(m.chat, { text: `⚠️ حاولت طرد @${m.sender.split('@')[0]} لكن البوت لم يتمكن.`, mentions: [m.sender] }).catch(()=>{})
      } finally {
        // إعادة ضبط العدّ
        try { delete chatObj.antilinkWarns[m.sender]; if (typeof global.db.write === 'function') global.db.write() } catch {}
      }
      return true
    } else {
      // إرسال تحذير عادي مع عدد التحذيرات المتبقي
      const remaining = MAX_WARNS - next
      const warnMsg = `
❍━═━═━═━═━═━═━❍
❍⇇ تحذير من مضاد الروابط
❍
❍⇇ العضو ↜ @${m.sender.split('@')[0]}
❍⇇ تحذير رقم: ${next} / ${MAX_WARNS}
❍⇇ تبقى له: ${remaining} تحذيرات قبل الطرد
❍━═━═━═━═━═━═━❍
      `.trim()
      await conn.sendMessage(m.chat, { text: warnMsg, mentions: [m.sender] }).catch(() => {})
      return true
    }

  } catch (e) {
    console.error('antilink.before error:', e)
    return true
  }
}
// ===[ مضاد العرض الآلي فقط – قبل الرسائل ]===
// ملف: plugins/antiviewonce-auto.js
// الشكل: export async function before(m, { conn, isAdmin = false, isBotAdmin = false }) { ... }

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export async function before(m, { conn, isAdmin = false, isBotAdmin = false }) {
  try {
    // فقط داخل الجروبات، ولا ننفّذ على رسائل البوت أو بايليز نفسها
    if (!m.isGroup || m.fromMe || m.isBaileys) return true

    // تأمين بنية الـ DB
    if (!global.db) global.db = { data: { users: {}, chats: {}, settings: {} }, write: global.db?.write }
    global.db.data.chats = global.db.data.chats || {}
    const chat = global.db.data.chats[m.chat] ||= {}

    // إذا الخاصية غير مفعّلة في هذه المجموعة -> لا نفعل شيئًا
    if (!chat.antiviewonce) return true
    // إذا ضبطت التشغيل التلقائي على false فلا يعمل الآلي
    if (chat.antiviewonce_auto === false) return true

    // تأكد من الميتاداتا للحصول على صلاحيات الأدمن
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata || !Array.isArray(metadata.participants)) return true

    const normalize = id => (id || '').toString().replace(/:\d+/, '')
    const senderId = normalize(m.sender || '')

    // استثناء الأدمنين: لا نكشف رسائل الأدمنين آليًا
    const isSenderAdmin = metadata.participants.some(p => {
      const pid = normalize(p.id)
      return pid === senderId && (p.admin || p.isAdmin || p.isSuperAdmin)
    })
    if (isSenderAdmin) return true

    // تحقق من أن الرسالة هي viewOnce (يدعم إصدارات متعددة)
    const isViewOnce =
      m.mtype === 'viewOnceMessageV2' ||
      m.mtype === 'viewOnceMessageV2Extension' ||
      Boolean(m.message?.viewOnceMessage)

    if (!isViewOnce) return true

    // استخراج inner message
    let innerMsg = null
    if (m.mtype === 'viewOnceMessageV2') innerMsg = m.message.viewOnceMessageV2?.message
    else if (m.mtype === 'viewOnceMessageV2Extension') innerMsg = m.message.viewOnceMessageV2Extension?.message
    else if (m.message?.viewOnceMessage) innerMsg = m.message.viewOnceMessage

    if (!innerMsg) return true

    const typeKey = Object.keys(innerMsg)[0] // مثال: imageMessage, videoMessage, audioMessage
    const mediaMessage = innerMsg[typeKey]
    if (!mediaMessage) return true

    // نوع الستريم المطلوب للتحميل
    const streamType = typeKey.includes('image') ? 'image' : typeKey.includes('video') ? 'video' : 'audio'

    // تنزيل المحتوى إلى Buffer (يدعم async iterator)
    let buffer = Buffer.from([])
    try {
      const stream = await downloadContentFromMessage(mediaMessage, streamType)
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    } catch (e) {
      // فشل التنزيل يعني لا يمكن إعادة الإرسال
      console.error('antiviewonce-auto: download failed', e)
      return true
    }

    if (!buffer || buffer.length === 0) return true

    // حساب الحجم ونص الوصف
    const fileLenRaw = mediaMessage.fileLength ?? mediaMessage?.fileLength?.low ?? buffer.length
    const fileSize = typeof fileLenRaw === 'number' ? fileLenRaw : (fileLenRaw?.toNumber ? fileLenRaw.toNumber() : buffer.length)
    const sizeText = formatFileSize(fileSize)
    const mediaCaption = (mediaMessage.caption || mediaMessage?.contextInfo?.caption || '').toString()

    const caption = `
❍━═━═━═━═━═━═━❍
❍⇇ تم كشف محتوى viewOnce آليًا
❍
❍⇇ النوع ↜ ${typeKey === 'imageMessage' ? 'صورة' : typeKey === 'videoMessage' ? 'فيديو' : 'صوت/ملف'}
❍⇇ المرسل ↜ @${m.sender.split('@')[0]}
${mediaCaption ? `❍⇇ الكتابة ↜ ${mediaCaption}\n` : ''}❍⇇ الحجم ↜ ${sizeText}
❍━═━═━═━═━═━═━❍
    `.trim()

    // حذف الرسالة الأصلية إن كان البوت أدمن
    let botIsAdmin = !!isBotAdmin
    if (!botIsAdmin) {
      // حاول تحديد صلاحيات البوت من metadata
      const botId = normalize(conn.user?.id || conn.user?.jid || '')
      botIsAdmin = metadata.participants.some(p => {
        const pid = normalize(p.id)
        return pid === botId && (p.admin || p.isAdmin || p.isSuperAdmin)
      })
    }

    if (botIsAdmin) {
      try {
        if (m.key) {
          await conn.sendMessage(m.chat, {
            delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.sender }
          }).catch(()=>{})
        }
      } catch (e) {
        // تجاهل فشل الحذف
      }
    }

    // إعادة الإرسال بحسب النوع
    try {
      if (typeKey === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: buffer, caption, mentions: [m.sender] }, { quoted: m }).catch(()=>{})
      } else if (typeKey === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: buffer, caption, gifPlayback: mediaMessage.gifPlayback || false, mentions: [m.sender] }, { quoted: m }).catch(()=>{})
      } else if (typeKey === 'audioMessage' || typeKey === 'audioMessageV2') {
        const mimetype = mediaMessage.mimetype || 'audio/mpeg'
        const ptt = !!(mediaMessage.ptt || mediaMessage.seconds)
        await conn.sendMessage(m.chat, { audio: buffer, mimetype, ptt, waveform: mediaMessage.waveform || null }, { quoted: m }).catch(()=>{})
        await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m }).catch(()=>{})
      } else {
        // نوع غير متوقع: أرسل النص فقط
        await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m }).catch(()=>{})
      }
    } catch (e) {
      console.error('antiviewonce-auto: resend failed', e)
    }

  } catch (err) {
    console.error('antiviewonce-auto error:', err)
  }

  return true
}

// مساعدة صغيرة لتحويل الحجم إلى نص
function formatFileSize(bytes) {
  try {
    if (!bytes || bytes === 0) return '0 بايت'
    const sizes = ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت', 'تيرابايت']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  } catch {
    return 'غير معروف'
  }
}
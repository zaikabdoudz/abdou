// ===[ التفعيلات – نسخة مُنقّحة – مطابق لهيكلتك ]===
// ملف: plugins/enable.js

const IMAGES = [
  'https://files.catbox.moe/bxvker.jpg',
  'https://files.catbox.moe/vnnzpf.jpg',
  'https://files.catbox.moe/vss05f.jpg'
]

// دالة حفظ آمنة للـ DB (لو موجودة)
const saveDB = () => {
  try { global.db?.write && global.db.write() } catch (e) { console.error('saveDB error:', e) }
}

// اختصار لفشل الصلاحيات (يعتمد على global.dfail إن موجود)
const failPerm = (type, m, conn) => {
  if (typeof global?.dfail === 'function') return global.dfail(type, m, conn)
  // fallback بسيط
  return conn.sendMessage?.(m.chat, { text: type === 'group' ? 'هذا الامر للجروبات فقط' : type === 'admin' ? 'هذا الامر للمشرفين فقط' : 'غير مسموح' }, { quoted: m }).catch(()=>{})
}

const handler = async (m, { conn, usedPrefix = '.', command = '', args = [], isOwner = false, isAdmin = false, isROwner = false }) => {
  try {
    // نص القائمة المفصل (عرض عند عدم وجود خيار)
    const optionsFull = `
❍━═━═━═━═━═━═━❍
       ❍ تـفـعـيـلات الـمـجـمـوعـة ❍
❍━═━═━═━═━═━═━❍

*الترحيب*          ↜ رسالة ترحيب للأعضاء الجدد
*مضاد_اللينكات*    ↜ حذف كل أنواع الروابط
*كشف*               ↜ كشف + كشف متقدم للجروب
*مضاد_العرض*       ↜ إعادة إرسال المخفي (ViewOnce)
*مضاد_الإشراف*     ↜ حماية المشرفين + طرد المتمرد
*مضاد_البوت*       ↜ كشف وطرد أي بوت Baileys
*مضاد_الشتائم*     ↜ كشف الشتائم + حظر
*قبول_تلقائي*      ↜ قبول كل طلب انضمام
*مضاد_الخاص*       ↜ حظر أي رسالة خاصة (للمطور)

الاستخدام:
${usedPrefix}فتح الترحيب
${usedPrefix}قفل مضاد_اللينكات
❍━═━═━═━═━═━═━❍
`.trim()

    // تحديد النوع (يدعم مسافات _ و underscore)
    const cmd = (command || '').toString().toLowerCase()
    const type = (Array.isArray(args) ? args.join('_') : (args || []).join('_') || '').toLowerCase().replace(/\s+/g, '_')

    // هل الفتح أو القفل
    const isEnable = /^(فتح|فعل|enable|on|true|1)$/i.test(cmd)

    // تأمين وصول الـ DB
    const chat = global.db = global.db || {}
    global.db.data = global.db.data || { chats: {}, users: {}, settings: {} }
    const chats = global.db.data.chats
    const users = global.db.data.users
    const settings = global.db.data.settings

    const chatObj = chats[m.chat] ||= {}
    const userObj = users[m.sender] ||= {}
    const botObj = settings[conn.user?.jid] ||= {}

    // لو لم يكتب خيار نعرض القائمة
    if (!type) {
      return await conn.sendMessage(m.chat, {
        image: { url: IMAGES[Math.floor(Math.random() * IMAGES.length)] },
        caption: optionsFull
      }, { quoted: m })
    }

    // تحويل aliases الشائعة إلى مفاتيح موحدة
    const key = type
      .replace(/^مضاد_?ال?لينكات2?$/, 'مضاد_اللينكات')
      .replace(/^مضاد_?العرض$/, 'مضاد_العرض')
      .replace(/^مضاد_?ال?شتائم$/, 'مضاد_الشتائم')
      .replace(/^قبول_?تلقائي$/, 'قبول_تلقائي')
      .replace(/^مضاد_?ال?خاص$/, 'مضاد_الخاص')
      .replace(/^كشف2?$/, 'كشف')

    let isAll = false

    // تطبيق الإعدادات مع التحقق من الصلاحيات
    switch (key) {
      case 'الترحيب':
        if (!m.isGroup && !isOwner) return failPerm('group', m, conn)
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.welcome = isEnable
        break

      case 'مضاد_اللينكات':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.antiLink = isEnable
        break

      case 'كشف':
        if (!m.isGroup && !isOwner) return failPerm('group', m, conn)
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.detect = isEnable
        chatObj.detect2 = isEnable
        break

      case 'مضاد_العرض':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.antiviewonce = isEnable
        break

      case 'مضاد_الإشراف':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.antiAdmin = isEnable
        break

      case 'مضاد_البوت':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.antiBot = isEnable
        break

      case 'مضاد_الشتائم':
        if (m.isGroup && !(isAdmin || isOwner || isROwner)) return failPerm('admin', m, conn)
        chatObj.antiToxic = isEnable
        break

      case 'قبول_تلقائي':
        if (!isOwner && !isROwner) return failPerm('owner', m, conn)
        isAll = true
        botObj.autoAccept = isEnable
        break

      case 'مضاد_الخاص':
        if (!isOwner && !isROwner) return failPerm('owner', m, conn)
        isAll = true
        botObj.antiPrivate = isEnable
        break

      default:
        // غير معروف -> ارجاع القائمة
        return await conn.sendMessage(m.chat, { text: optionsFull }, { quoted: m })
    }

    // حفظ التغييرات
    saveDB()

    // رسالة تأكيد مزخرفة
    const displayOption = (args.length ? args.join(' ') : key)
    const status = isEnable ? '*مفعّل*' : '*معطّل*'
    const scope = isAll ? 'البوت كامل' : 'هذه الدردشة'
    const action = isEnable ? 'تـم تـفـعـيـل' : 'تـم إيـقـاف'

    const reply = `
❍━═━═━═━═━═━═━❍
❍⇇ ${action} الإعداد بنجاح
❍
❍⇇ الإعداد ↜ *${displayOption.replace(/_/g, ' ')}*
❍⇇ الحالة  ↜ ${status}
❍⇇ النطاق  ↜ *${scope}*
❍
❍⇇ بواسطة ↜ @${m.sender.split('@')[0]}
❍━═━═━═━═━═━═━❍
    `.trim()

    try {
      await conn.sendMessage(m.chat, {
        image: { url: IMAGES[Math.floor(Math.random() * IMAGES.length)] },
        caption: reply,
        mentions: [m.sender]
      }, { quoted: m })
    } catch (e) {
      try { await m.reply(reply) } catch {}
    }

  } catch (err) {
    console.error('enable handler error:', err)
    try { await m.reply('حصل خطأ غير متوقع — حاول لاحقًا') } catch {}
  }
}

handler.help = ['فتح', 'قفل'].map(v => v + ' <الخيار>')
handler.tags = ['group', 'owner']
handler.command = /^(فتح|قفل|فعل|enable|disable|en|dis)$/i
handler.group = true

export default handler
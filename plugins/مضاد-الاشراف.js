import { areJidsSameUser } from '@whiskeysockets/baileys'

// === مضاد الإشراف — نسخة مصحّحة تعمل مباشرة ===
// وضع الملف: plugins/antiadmin.js
// يشغّل مع أوامرك: .فتح مضاد_الإشراف / .قفل مضاد_الإشراف

if (global.conn) {
  if (!global.conn._antiAdminListener) {
    global.conn._antiAdminListener = true

    // تخزين حالة الأدمن لكل مجموعة
    global.conn._antiAdminCache = global.conn._antiAdminCache || {}

    global.conn.ev.on('group-participants.update', async (update) => {
      try {
        const chatId = update.id || update.jid || update.groupId
        if (!chatId) return

        // تأكد إن الحماية مفعلة بالمجموعة
        const chat = global.db?.data?.chats?.[chatId]
        if (!chat?.antiAdmin) return

        // جلب metadata الحالية (سيحدد من الأدمن الآن)
        const metadata = await global.conn.groupMetadata(chatId).catch(() => null)
        if (!metadata || !Array.isArray(metadata.participants)) return

        const botJid = global.conn.user?.jid
        const botIsAdmin = metadata.participants.some(p => areJidsSameUser(p.id, botJid) && (p.admin || p.isAdmin || p.isSuperAdmin))
        if (!botIsAdmin) return // البوت لازم يكون أدمن

        // قوائم الاستثناءات — اضف أي رقم تريد هنا بصيغة full jid
        const ownerJid = (global.owner && Array.isArray(global.owner) && global.owner[0] && global.owner[0][0]) ? `${global.owner[0][0]}@s.whatsapp.net` : null
        const hardExempts = ['213774297599@s.whatsapp.net'] // الرقم اللي طلبته محفوظ كمستثنى
        const exemptArray = [botJid, ownerJid, ...hardExempts].filter(Boolean)
        const isExempt = (jid) => exemptArray.some(e => areJidsSameUser(e, jid))

        // احصل على لائحة الأدمن الحالية من metadata
        const currentAdmins = metadata.participants.filter(p => p.admin || p.isAdmin || p.isSuperAdmin).map(p => p.id)

        // cache سابق
        const prevAdmins = global.conn._antiAdminCache[chatId] || currentAdmins

        // حدّد من تم سحب إشرافه (كان أدمن سابقًا ولم يعد كذلك الآن)
        const demoted = prevAdmins.filter(prev => !currentAdmins.some(cur => areJidsSameUser(cur, prev)))

        // حدّث الكاش فورًا
        global.conn._antiAdminCache[chatId] = currentAdmins

        if (!demoted || demoted.length === 0) return

        // عملية معالجة كل ضحية تم سحب إشرافها
        for (const victim of demoted) {
          try {
            // لو الضحية مستثناة (مثلاً owner أو البوت)، نتجاوز
            if (isExempt(victim)) continue

            // تأخير بسيط لثبات حالة واتساب/Baileys
            await new Promise(r => setTimeout(r, 1000))

            // حاول إعادة الإشراف مرة واحدة (بدون محاولات كثيرة)
            try {
              await global.conn.groupParticipantsUpdate(chatId, [victim], 'promote')
              // إرسال إشعار مقتضب في المجموعة (اختياري)
              await global.conn.sendMessage(chatId, { text: `تمت إعادة الإشراف تلقائيًا لـ @${victim.split('@')[0]}`, mentions: [victim] }).catch(() => {})
            } catch (e) {
              console.error('AntiAdmin: فشل إعادة الإشراف على الضحية', { chatId, victim, error: e?.message || e })
              await global.conn.sendMessage(chatId, { text: `فشل إعادة الإشراف لـ @${victim.split('@')[0]} — تأكد إن البوت أدمن`, mentions: [victim] }).catch(() => {})
            }

            // الآن حدّد المتمردين: الأدمن الحاليين (بعد التحديث) الذين ليسوا مستثنين وليسوا الضحية
            const latestMeta = await global.conn.groupMetadata(chatId).catch(() => null)
            const latestAdmins = (latestMeta?.participants || []).filter(p => p.admin || p.isAdmin || p.isSuperAdmin).map(p => p.id)

            for (const admin of latestAdmins) {
              try {
                if (areJidsSameUser(admin, botJid)) continue
                if (areJidsSameUser(admin, victim)) continue
                if (isExempt(admin)) continue

                // اطرد المتمرد مرة واحدة
                await global.conn.groupParticipantsUpdate(chatId, [admin], 'remove')
                await global.conn.sendMessage(chatId, { text: `تم طرد المتمرد @${admin.split('@')[0]} — محاولة لعب بالإشراف`, mentions: [admin] }).catch(() => {})
              } catch (e) {
                console.error('AntiAdmin: فشل طرد متمرد', { chatId, admin, error: e?.message || e })
                // لا نكرر المحاولة. رسالة خطأ مختصرة لإعلام الأدمنز إن شيء فشل
                await global.conn.sendMessage(chatId, { text: `فشل طرد @${admin.split('@')[0]} — تأكد إن البوت أدمن وصلاحياته كاملة`, mentions: [admin] }).catch(() => {})
              }
            }

            // حدّث الكاش إلى أحدث لائحة أدمن بعد كل عملية
            const finalMeta = await global.conn.groupMetadata(chatId).catch(() => null)
            const finalAdmins = (finalMeta?.participants || []).filter(p => p.admin || p.isAdmin || p.isSuperAdmin).map(p => p.id)
            global.conn._antiAdminCache[chatId] = finalAdmins

          } catch (innerErr) {
            console.error('AntiAdmin: خطأ داخل معالجة الضحية', { chatId, victim, error: innerErr?.message || innerErr })
          }
        }

      } catch (err) {
        console.error('AntiAdmin: خطأ عام في listener', { update, error: err?.message || err })
      }
    })

    // تهيئة الكاش عند تشغيل البوت لكل مجموعات موجودة (غير إجبارية لكن مفيدة)
    ;(async () => {
      try {
        const chats = Object.keys(global.db?.data?.chats || {})
        for (const id of chats) {
          try {
            const meta = await global.conn.groupMetadata(id).catch(() => null)
            if (!meta || !Array.isArray(meta.participants)) continue
            const admins = meta.participants.filter(p => p.admin || p.isAdmin || p.isSuperAdmin).map(p => p.id)
            global.conn._antiAdminCache[id] = admins
          } catch (e) { /* تخطى الأخطاء للمجموعة */ }
        }
      } catch (e) { /* لا توقف التشغيل لو فشل */ }
    })()

  }
}

let handler = async (m, { conn, usedPrefix, command }) => {

    let user = null

    if (m.quoted?.sender) {
        user = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        user = m.mentionedJid[0]
    } else if (m.text && /^\d+$/.test(m.text.trim())) {
        const number = m.text.trim()
        if (number.length < 7 || number.length > 15)
            return conn.reply(m.chat, `*[ ⚠️ ] الرقم غير صحيح!*`, m)
        user = number + '@s.whatsapp.net'
    } else {
        return conn.reply(m.chat,
            `*[❗] الاستخدام الصحيح:*\n\n*┠≽ ${usedPrefix}${command} @منشن*\n*┠≽ ${usedPrefix}${command} (بالرد على رسالة)*`, m)
    }

    // جلب بيانات المجموعة
    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!groupMetadata) return conn.reply(m.chat, `*[ ⚠️ ] تعذر جلب بيانات المجموعة!*`, m)

    const userNum = user.split('@')[0]

    // البحث عن المستخدم بكل الصيغ الممكنة
    const targetMember = groupMetadata.participants.find(p =>
        p.id === user ||
        p.phoneNumber === user ||
        p.jid === user ||
        (p.id || '').split('@')[0] === userNum ||
        (p.phoneNumber || '').split('@')[0] === userNum
    )

    if (!targetMember)
        return conn.reply(m.chat, `*[ ⚠️ ] المستخدم غير موجود في المجموعة!*`, m)

    if (targetMember.admin === 'admin' || targetMember.admin === 'superadmin')
        return conn.reply(m.chat, `*[ ⚠️ ] هذا المستخدم مشرف مسبقاً!*`, m)

    // ✅ BailMod: id (@lid) للعملية، phoneNumber للمنشن
    const lidJid = targetMember.id
    const phoneJid = targetMember.phoneNumber || user

    await conn.groupParticipantsUpdate(m.chat, [lidJid], 'promote')
    await conn.reply(m.chat, `*✅ تمت ترقية @${phoneJid.split('@')[0]} إلى مشرف بنجاح!*`, m, { mentions: [phoneJid] })
}

handler.help = ['ترقيه @منشن', 'ترقيه (بالرد)']
handler.tags = ['group']
handler.command = /^(ترقيه|ترقية|رفع|ارفع|promote)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

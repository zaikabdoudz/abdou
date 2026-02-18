let handler = async (m, { conn, usedPrefix, command, text }) => {

    // تحديد المستخدم المستهدف
    let user = null

    if (m.quoted?.sender) {
        // رد على رسالة
        user = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        // منشن
        user = m.mentionedJid[0]
    } else if (text && !isNaN(text.replace(/[^0-9]/g, ''))) {
        // رقم مكتوب
        const number = text.replace(/[^0-9]/g, '')
        if (number.length < 11 || number.length > 13)
            return conn.reply(m.chat, `*الـرقـم غـلط !*`, m)
        user = number + '@s.whatsapp.net'
    } else {
        return conn.reply(m.chat, `*مـنـشن الــشـخص أو رد عـلى رسـالـتـه !*`, m)
    }

    // التحقق أن المستخدم في المجموعة
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants.map(p => p.id)
    if (!participants.includes(user))
        return conn.reply(m.chat, `*المستخدم مـو في المجموعة !*`, m)

    // التحقق أنه مشرف فعلاً
    const isAdmin = groupMetadata.participants.find(p => p.id === user)?.admin
    if (!isAdmin)
        return conn.reply(m.chat, `*المستخدم مـو مشرف أصلاً !*`, m)

    await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
    m.reply(`*تـــم الإعـفـاء ✓*`)
}

handler.help = ['demote (@tag)']
handler.tags = ['group']
handler.command = ['demote', 'اعفاء']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.fail = null

export default handler

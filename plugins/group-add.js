import moment from 'moment-timezone'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `❀ الرجاء إدخال الرقم الذي تريد إرسال الدعوة إليه.`, m)
    if (text.includes('+')) return conn.reply(m.chat, `ꕥ أدخل الرقم كامل بدون علامة *+*`, m)
    if (isNaN(text)) return conn.reply(m.chat, `ꕥ أدخل أرقام فقط بدون رمز الدولة أو فراغات.`, m)

    let group = m.chat
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
    let tag = m.sender ? '@' + m.sender.split('@')[0] : 'المستخدم'
    const chatLabel = m.isGroup ? (await conn.getName(m.chat) || 'المجموعة') : 'خاص'
    const horario = `${moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')}`

    const invite = `❀ دعوة إلى مجموعة\n\nꕥ *المستخدم* » ${tag}\n✿ *الدردشة* » ${chatLabel}\n✰ *التاريخ* » ${horario}\n✦ *الرابط* » ${link}`

    await conn.reply(`${text}@s.whatsapp.net`, invite, m, { mentions: [m.sender] })
    m.reply(`❀ تم إرسال رابط الدعوة للمستخدم بنجاح.`)
}

handler.help = ['invite']
handler.tags = ['group']
handler.command = ['add', 'ارسل', 'ابعثله']
handler.group = true
handler.botAdmin = true

export default handler
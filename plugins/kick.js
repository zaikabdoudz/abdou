const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.mentionedJid[0] && !m.quoted) return m.reply('《✧》 منشن أو رد على *رسالة* الشخص الذي تريد طرده')
  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
  const groupInfo = await conn.groupMetadata(m.chat)
  const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
  const ownerBot = global.owner[0] + '@s.whatsapp.net'
  const participant = groupInfo.participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user)
  if (!participant) return conn.reply(m.chat, `《✧》 *@${user.split('@')[0]}* غير موجود في المجموعة.`, m, { mentions: [user] })
  if (user === conn.decodeJid(conn.user.id)) return m.reply('《✧》 لا يمكنني طرد *البوت* من المجموعة')
  if (user === ownerGroup) return m.reply('《✧》 لا يمكنني طرد *مالك* المجموعة')
  if (user === ownerBot) return m.reply('《✧》 لا يمكنني طرد *مالك* البوت')
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    conn.reply(m.chat, `✎ تم طرد @${user.split('@')[0]} بنجاح`, m, { mentions: [user] })
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['طرد @منشن', 'طرد (بالرد)']
handler.tags = ['group']
handler.command = /^(طرد|كيك|kick)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler
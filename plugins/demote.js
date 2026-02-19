const handler = async (m, { conn }) => {
  const who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : false)
  if (!who) return m.reply('《✧》 منشن المستخدم الذي تريد إعفاؤه من المشرفية.')
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participant = groupMetadata.participants.find(p => p.phoneNumber === who || p.id === who || p.jid === who)
    if (!participant?.admin) return conn.sendMessage(m.chat, { text: `《✧》 *@${who.split('@')[0]}* ليس مشرفاً!`, mentions: [who] }, { quoted: m })
    if (who === groupMetadata.owner) return m.reply('《✧》 لا يمكن إعفاء مالك المجموعة.')
    if (who === conn.user.jid) return m.reply('《✧》 لا يمكن إعفاء البوت من المشرفية.')
    await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
    await conn.sendMessage(m.chat, { text: `✿ تم إعفاء *@${who.split('@')[0]}* من المشرفية.`, mentions: [who] }, { quoted: m })
  } catch (e) {
    await m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['اعفاء @منشن']
handler.tags = ['group']
handler.command = /^(اعفاء|اعفاء|خفض|demote)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler
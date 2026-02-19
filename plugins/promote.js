const handler = async (m, { conn, usedPrefix, command }) => {
  const who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : false)
  if (!who) return m.reply('《✧》 منشن المستخدم الذي تريد ترقيته إلى مشرف.')
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participant = groupMetadata.participants.find(p => p.phoneNumber === who || p.id === who || p.jid === who)
    if (participant?.admin) return conn.sendMessage(m.chat, { text: `《✧》 *@${who.split('@')[0]}* مشرف بالفعل!`, mentions: [who] }, { quoted: m })
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    await conn.sendMessage(m.chat, { text: `✿ تمت ترقية *@${who.split('@')[0]}* إلى مشرف بنجاح! 🎉`, mentions: [who] }, { quoted: m })
  } catch (e) {
    await m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['ترقية @منشن', 'ترقية (بالرد)']
handler.tags = ['group']
handler.command = /^(ترقية|ترقيه|رفع|ارفع|promote)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler
const handler = async (m, { conn, args }) => {
  const groupInfo = await conn.groupMetadata(m.chat)
  const participants = groupInfo.participants
  const pesan = args.join(' ')
  let teks = `﹒⌗﹒🌱 .ৎ˚₊‧  ${pesan || 'استدعاء الجميع 🪴'}\n\n𐚁 ֹ ִ \`تاق الكل\` ! ୧ ֹ ִ🍃\n\n🍄 \`الأعضاء :\` ${participants.length}\n🌿 \`طلب من :\` @${m.sender.split('@')[0]}\n\n` +
    `╭┄ ꒰ \`قائمة الأعضاء:\` ꒱ ┄\n`
  const mentions = []
  for (const mem of participants) {
    const id = mem.phoneNumber || mem.jid || mem.id || ''
    const num = id.split('@')[0]
    teks += `┊ꕥ @${num}\n`
    mentions.push(id)
  }
  teks += `╰⸼ ┄ ┄ ꒰ \`${global.botname}\` ꒱ ┄ ┄⸼`
  return conn.reply(m.chat, teks, m, { mentions: [m.sender, ...mentions] })
}
handler.help = ['منشن_الكل', 'tagall']
handler.tags = ['group']
handler.command = /^(منشن_الكل|tagall|تاق_الكل)$/i
handler.admin = true
handler.group = true
export default handler
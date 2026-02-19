const handler = async (m, { conn }) => {
  try {
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`
    const teks = `﹒⌗﹒🌿 .ৎ˚₊‧  رابط المجموعة:\n\n𐚁 ֹ ִ \`رابط المجموعة\` ! ୧ ֹ ִ🔗\n☘️ \`طلب من :\` @${m.sender.split('@')[0]}\n\n🌱 \`الرابط :\` ${link}`
    await conn.reply(m.chat, teks, m, { mentions: [m.sender] })
  } catch (e) {
    await m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['رابط']
handler.tags = ['group']
handler.command = /^(رابط|لينك|link)$/i
handler.botAdmin = true
handler.group = true
export default handler
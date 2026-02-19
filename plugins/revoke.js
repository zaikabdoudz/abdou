const handler = async (m, { conn }) => {
  try {
    await conn.groupRevokeInvite(m.chat)
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`
    const teks = `﹒⌗﹒🌿 تم تجديد رابط المجموعة:\n\n𐚁 ֹ ִ \`رابط جديد\` ! ୧ ֹ ִ🔗\n☘️ \`طلب من :\` @${m.sender.split('@')[0]}\n\n🌱 \`الرابط الجديد :\` ${link}`
    await m.react('🕒')
    await conn.reply(m.chat, teks, m, { mentions: [m.sender] })
    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    await m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['تجديد_رابط']
handler.tags = ['group']
handler.command = /^(تجديد_رابط|تجديد|revoke)$/i
handler.botAdmin = true
handler.group = true
export default handler
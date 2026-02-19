const handler = async (m, { conn, args, usedPrefix, chat }) => {
  const estado = chat.isBanned ?? false
  if (args[0] === 'off') {
    if (estado) return m.reply('《✧》 البوت كان *مغلقاً* بالفعل في هذه المجموعة.')
    chat.isBanned = true
    return m.reply(`《✧》 تم *إيقاف* البوت في هذه المجموعة.`)
  }
  if (args[0] === 'on') {
    if (!estado) return m.reply(`《✧》 البوت كان *مفعلاً* بالفعل في هذه المجموعة.`)
    chat.isBanned = false
    return m.reply(`《✧》 تم *تفعيل* البوت في هذه المجموعة.`)
  }
  return m.reply(`*✿ حالة البوت (｡•́‿•̀｡)*\n✐ *الحالة ›* ${estado ? '✗ مغلق' : '✓ مفعل'}\n\n✎ يمكنك تغييرها بـ:\n> ● _تفعيل ›_ *${usedPrefix}bot on*\n> ● _إيقاف ›_ *${usedPrefix}bot off*`)
}
handler.help = ['bot on/off']
handler.tags = ['group']
handler.command = /^(bot)$/i
handler.admin = true
handler.group = true
export default handler
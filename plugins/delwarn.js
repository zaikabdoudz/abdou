const handler = async (m, { conn, args, chat }) => {
  const mentioned = m.mentionedJid || []
  const who = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
  if (!who) return m.reply('《✧》 منشن أو رد على المستخدم الذي تريد حذف تحذيره.')
  const user = chat.users?.[who]
  if (!user) return m.reply('《✧》 المستخدم غير موجود في قاعدة البيانات.')
  const total = user?.warnings?.length || 0
  if (total === 0) return conn.reply(m.chat, `《✧》 @${who.split('@')[0]} لا يملك أي تحذيرات.`, m, { mentions: [who] })
  const name = global.db.data.users[who]?.name || 'مستخدم'
  const rawIndex = mentioned.length > 0 ? args[1] : args[0]
  if (rawIndex?.toLowerCase() === 'all') {
    user.warnings = []
    return conn.reply(m.chat, `✐ تم حذف جميع تحذيرات @${who.split('@')[0]} (${name}).`, m, { mentions: [who] })
  }
  const index = parseInt(rawIndex)
  if (isNaN(index)) return m.reply('《✧》 حدد رقم التحذير أو اكتب all لحذف الكل.')
  if (index < 1 || index > total) return m.reply(`ꕥ الرقم يجب أن يكون بين 1 و${total}.`)
  user.warnings.splice(total - index, 1)
  await conn.reply(m.chat, `ꕥ تم حذف التحذير #${index} لـ @${who.split('@')[0]} (${name}).`, m, { mentions: [who] })
}
handler.help = ['حذف_تحذير @منشن <رقم>', 'حذف_تحذير @منشن all']
handler.tags = ['group']
handler.command = /^(حذف_تحذير|مسح_تحذير|delwarn)$/i
handler.admin = true
handler.group = true
export default handler
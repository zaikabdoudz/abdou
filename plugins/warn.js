const handler = async (m, { conn, args, chat }) => {
  const mentioned = m.mentionedJid || []
  const who = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
  if (!who) return m.reply('《✧》 منشن أو رد على المستخدم الذي تريد تحذيره.')
  const reason = mentioned.length > 0 ? args.slice(1).join(' ') || 'بدون سبب.' : args.slice(0).join(' ') || 'بدون سبب.'
  try {
    if (!chat.users) chat.users = {}
    if (!chat.users[who]) chat.users[who] = {}
    const user = chat.users[who]
    if (!user.warnings) user.warnings = []
    const timestamp = new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    user.warnings.unshift({ reason, timestamp, by: m.sender })
    const total = user.warnings.length
    const name = global.db.data.users[who]?.name || 'مستخدم'
    const warningList = user.warnings.map((w, i) => `\`#${total - i}\` » ${w.reason}\n> » التاريخ: ${w.timestamp}`).join('\n')
    let message = `✐ تم إضافة تحذير لـ @${who.split('@')[0]}.\n✿ إجمالي التحذيرات \`(${total})\`:\n\n${warningList}`
    const warnLimit = chat.warnLimit || 3
    const expulsar = chat.expulsar === true
    if (total >= warnLimit && expulsar) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        delete chat.users[who]
        delete global.db.data.users[who]
        message += `\n\n> ❖ وصل المستخدم للحد الأقصى من التحذيرات وتم طرده.`
      } catch {
        message += `\n\n> ❖ وصل للحد الأقصى لكن تعذر الطرد تلقائياً.`
      }
    } else if (total >= warnLimit) {
      message += `\n\n> ❖ وصل المستخدم للحد الأقصى من التحذيرات.`
    }
    await conn.reply(m.chat, message, m, { mentions: [who] })
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['تحذير @منشن <السبب>']
handler.tags = ['group']
handler.command = /^(تحذير|warn)$/i
handler.admin = true
handler.group = true
export default handler
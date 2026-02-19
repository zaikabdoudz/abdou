const handler = async (m, { conn, args, chat }) => {
  const who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender)
  if (!chat.users?.[who]) return m.reply(`「✎」 المستخدم غير مسجل في البوت.`)
  const userStats = chat.users[who].stats || {}
  const daysArg = parseInt(args[0]) || 30
  const cutoff = new Date(Date.now() - daysArg * 86400000)
  const days = Object.entries(userStats).filter(([date]) => new Date(date) >= cutoff).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
  const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)
  let report = `❀ إحصائيات رسائل @${who.split('@')[0]}\n`
  report += `> الإجمالي خلال *${daysArg}* يوم: \`${totalMsgs}\` رسالة\n\n`
  for (const [date, d] of days) {
    const fecha = new Date(date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })
    report += `*❏ ${fecha}*\n\t» رسائل: \`${d.msgs || 0}\`، أوامر: \`${d.cmds || 0}\`\n`
  }
  await conn.reply(m.chat, report, m, { mentions: [who] })
}
handler.help = ['رسائل @منشن', 'رسائل (أيام)']
handler.tags = ['group']
handler.command = /^(رسائل|عدد_رسائل|count|messages)$/i
handler.group = true
export default handler
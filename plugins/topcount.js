const handler = async (m, { conn, args, command, chat }) => {
  const daysArg = args[0] ? parseInt(args[0]) : 1
  if (daysArg < 1) return m.reply(`「✎」 عدد الأيام يجب أن يكون أكبر من 0.`)
  const cutoff = new Date(Date.now() - daysArg * 86400000)
  const ranking = Object.entries(chat.users || {})
    .map(([jid, user]) => {
      const stats = user.stats || {}
      const days = Object.entries(stats).filter(([date]) => new Date(date) >= cutoff)
      const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
      const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)
      return { jid, totalMsgs, totalCmds }
    })
    .filter(u => u.totalMsgs > 0)
    .sort((a, b) => b.totalMsgs - a.totalMsgs)
  if (ranking.length === 0) return m.reply(`「✎」 لا يوجد نشاط خلال ${daysArg} يوم.`)
  const page = parseInt(args[1]) || 1
  const perPage = 10
  const totalPages = Math.ceil(ranking.length / perPage)
  if (page < 1 || page > totalPages) return m.reply(`「✎」 صفحة غير صحيحة. يوجد ${totalPages} صفحة فقط.`)
  const pageRanking = ranking.slice((page-1)*perPage, page*perPage)
  let report = `❀ أكثر الأعضاء نشاطاً خلال *${daysArg}* يوم\n\n`
  pageRanking.forEach((u, i) => {
    const name = global.db.data.users[u.jid]?.name || u.jid.split('@')[0]
    report += `*${(page-1)*perPage + i + 1}.* ${name}\n   » رسائل: \`${u.totalMsgs}\`، أوامر: \`${u.totalCmds}\`\n`
  })
  if (page < totalPages) report += `\n> للصفحة التالية › *${global.prefix || '.'}${command} ${daysArg} ${page+1}*`
  await conn.reply(m.chat, report, m)
}
handler.help = ['اكثر_نشاطاً <أيام>']
handler.tags = ['group']
handler.command = /^(اكثر_نشاطاً|topcount|topmessages)$/i
handler.group = true
export default handler
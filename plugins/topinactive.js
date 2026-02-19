const handler = async (m, { conn, args, command, chat }) => {
  let daysArg = args[0] ? parseInt(args[0]) : 30
  if (daysArg < 1) daysArg = 30
  const cutoff = new Date(Date.now() - daysArg * 86400000)
  const ranking = Object.entries(chat.users || {})
    .map(([jid, user]) => {
      const stats = user.stats || {}
      const totalMsgs = Object.entries(stats).filter(([date]) => new Date(date) >= cutoff).reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
      return { jid, totalMsgs }
    })
    .sort((a, b) => a.totalMsgs - b.totalMsgs)
  if (ranking.length === 0) return m.reply(`「✎」 لا يوجد نشاط خلال ${daysArg} يوم.`)
  const page = parseInt(args[1]) || 1
  const perPage = 10
  const totalPages = Math.ceil(ranking.length / perPage)
  if (page < 1 || page > totalPages) return m.reply(`「✎」 صفحة غير صحيحة. يوجد ${totalPages} صفحة فقط.`)
  const pageRanking = ranking.slice((page-1)*perPage, page*perPage)
  const mentions = []
  let report = `❀ أقل الأعضاء نشاطاً\n> » الأيام: \`${daysArg}\`\n> » الصفحة: \`${page}\` من \`${totalPages}\`\n\n`
  pageRanking.forEach((u, i) => {
    const name = global.db.data.users[u.jid]?.name || '@' + u.jid.split('@')[0]
    report += `*${(page-1)*perPage + i + 1}.* ${name}\n   » رسائل: \`${u.totalMsgs}\`\n`
    mentions.push(u.jid)
  })
  if (page < totalPages) report += `\n> للصفحة التالية › *${global.prefix || '.'}${command} ${daysArg} ${page+1}*`
  await conn.reply(m.chat, report, m, { mentions })
}
handler.help = ['اقل_نشاطاً <أيام>']
handler.tags = ['group']
handler.command = /^(اقل_نشاطاً|topinactive|topinactivos)$/i
handler.group = true
export default handler
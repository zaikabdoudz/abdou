const handler = async (m, { conn, chat }) => {
  const mentioned = m.mentionedJid || []
  const who = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
  if (!who || !chat.users?.[who]) return m.reply('《✧》 منشن أو رد على مستخدم صالح لعرض تحذيراته.')
  const user = chat.users[who]
  const total = user.warnings?.length || 0
  if (total === 0) return conn.reply(m.chat, `《✧》 @${who.split('@')[0]} لا يملك أي تحذيرات.`, m, { mentions: [who] })
  const name = global.db.data.users[who]?.name || 'مستخدم'
  const warningList = user.warnings.map((w, i) => {
    const author = w.by ? `\n> » بواسطة: @${w.by.split('@')[0]}` : ''
    return `\`#${total - i}\` » ${w.reason}\n> » التاريخ: ${w.timestamp}${author}`
  }).join('\n')
  await conn.reply(m.chat, `✐ تحذيرات @${who.split('@')[0]} (${name}):\n> ✧ الإجمالي: \`${total}\`\n\n${warningList}`, m, { mentions: [who, ...user.warnings.map(w => w.by).filter(Boolean)] })
}
handler.help = ['تحذيرات @منشن']
handler.tags = ['group']
handler.command = /^(تحذيرات|warns)$/i
handler.admin = true
handler.group = true
export default handler
const handler = async (m, { conn, args }) => {
  const newDesc = args.join(' ').trim()
  if (!newDesc) return m.reply('《✧》 أدخل الوصف الجديد للمجموعة.')
  try {
    await conn.groupUpdateDescription(m.chat, newDesc)
    m.reply('✿ تم تغيير وصف المجموعة بنجاح.')
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['تغيير_وصف <الوصف>']
handler.tags = ['group']
handler.command = /^(تغيير_وصف|وصف_المجموعة|setgpdesc)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler
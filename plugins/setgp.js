const handler = async (m, { conn, args }) => {
  const newName = args.join(' ').trim()
  if (!newName) return m.reply('《✧》 أدخل الاسم الجديد للمجموعة.')
  try {
    await conn.groupUpdateSubject(m.chat, newName)
    m.reply(`✿ تم تغيير اسم المجموعة بنجاح.`)
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['تغيير_اسم <الاسم>']
handler.tags = ['group']
handler.command = /^(تغيير_اسم|اسم_المجموعة|setgpname)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler
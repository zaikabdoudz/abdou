const handler = async (m, { conn, usedPrefix, command, text, chat }) => {
  const value = text ? text.trim() : ''
  if (!value) return m.reply(`ꕥ أرسل رسالة الترحيب.\n> يمكنك استخدام {usuario} و{grupo} كمتغيرات.\n\n✐ مثال:\n${usedPrefix}ترحيب مرحباً {usuario} في {grupo}!`)
  chat.sWelcome = value
  return m.reply(`ꕥ تم تعيين رسالة الترحيب بنجاح.`)
}
handler.help = ['ترحيب <الرسالة>']
handler.tags = ['group']
handler.command = /^(ترحيب|رسالة_ترحيب|setwelcome)$/i
handler.admin = true
handler.group = true
export default handler
const handler = async (m, { conn, usedPrefix, command, text, chat }) => {
  const value = text ? text.trim() : ''
  if (!value) return m.reply(`ꕥ أرسل رسالة الوداع.\n> يمكنك استخدام {usuario} و{grupo} كمتغيرات.\n\n✐ مثال:\n${usedPrefix}وداع وداعاً {usuario}!`)
  chat.sGoodbye = value
  return m.reply(`ꕥ تم تعيين رسالة الوداع بنجاح.`)
}
handler.help = ['وداع <الرسالة>']
handler.tags = ['group']
handler.command = /^(وداع|رسالة_وداع|setgoodbye)$/i
handler.admin = true
handler.group = true
export default handler
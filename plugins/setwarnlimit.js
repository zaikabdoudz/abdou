const handler = async (m, { conn, args, usedPrefix, chat }) => {
  const limit = parseInt(args[0])
  if (isNaN(limit) || limit < 0 || limit > 10) {
    return m.reply(`✐ الحد يجب أن يكون بين \`1\` و\`10\`، أو \`0\` للإيقاف.\n> مثال 1 › *${usedPrefix}حد_تحذيرات 5*\n> مثال 2 › *${usedPrefix}حد_تحذيرات 0*\n\n❖ الحالة الحالية: ${chat.expulsar ? `\`${chat.warnLimit}\` تحذيرات` : '\`مغلق\`'}`)
  }
  if (limit === 0) {
    chat.warnLimit = 0
    chat.expulsar = false
    return m.reply(`✐ تم إيقاف الطرد التلقائي عند الوصول للحد الأقصى.`)
  }
  chat.warnLimit = limit
  chat.expulsar = true
  await m.reply(`✐ تم تعيين الحد الأقصى للتحذيرات إلى \`${limit}\` لهذه المجموعة.\n> ❖ سيتم طرد المستخدمين تلقائياً عند الوصول لهذا الحد.`)
}
handler.help = ['حد_تحذيرات <رقم>']
handler.tags = ['group']
handler.command = /^(حد_تحذيرات|setwarnlimit)$/i
handler.admin = true
handler.group = true
export default handler
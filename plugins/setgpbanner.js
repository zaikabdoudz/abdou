const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || q.mediaType || ''
  if (!/image/.test(mime)) return m.reply('《✧》 أرسل أو رد على صورة لتغيير صورة المجموعة.')
  const img = await q.download()
  if (!img) return m.reply('《✧》 تعذر تحميل الصورة.')
  try {
    await conn.updateProfilePicture(m.chat, img)
    m.reply('✿ تم تغيير صورة المجموعة بنجاح.')
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['تغيير_صورة (بالرد على صورة)']
handler.tags = ['group']
handler.command = /^(تغيير_صورة|صورة_المجموعة|setgpbanner)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true
export default handler
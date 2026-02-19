const handler = async (m, { conn, args }) => {
  try {
    const timeout = args[0] ? msParser(args[0]) : 0
    if (args[0] && !timeout) return conn.reply(m.chat, 'صيغة غير صحيحة. مثال: 10s, 5m, 2h', m)
    const groupMetadata = await conn.groupMetadata(m.chat)
    if (groupMetadata.announce === true) return conn.reply(m.chat, `《✧》 المجموعة مغلقة بالفعل.`, m)
    const applyAction = async () => {
      await conn.groupSettingUpdate(m.chat, 'announcement')
      return conn.reply(m.chat, `✿ تم إغلاق المجموعة بنجاح.`, m)
    }
    if (timeout > 0) {
      await conn.reply(m.chat, `❀ ستغلق المجموعة بعد ${clockString(timeout)}.`, m)
      setTimeout(async () => {
        try { const md = await conn.groupMetadata(m.chat); if (md.announce === true) return; await applyAction() } catch {}
      }, timeout)
    } else {
      await applyAction()
    }
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['اغلاق', 'اغلاق 10m']
handler.tags = ['group']
handler.command = /^(اغلاق|اقفال|غلق|closet|close)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

function msParser(str) {
  const match = str.match(/^(\d+)([smhd])$/i)
  if (!match) return null
  const num = parseInt(match[1])
  const unit = match[2].toLowerCase()
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return num * (map[unit] || null)
}
function clockString(ms) {
  const d = Math.floor(ms/86400000), h = Math.floor(ms/3600000)%24, m = Math.floor(ms/60000)%60, s = Math.floor(ms/1000)%60
  const parts = []
  if (d > 0) parts.push(`${d} يوم`)
  if (h > 0) parts.push(`${h} ساعة`)
  if (m > 0) parts.push(`${m} دقيقة`)
  if (s > 0) parts.push(`${s} ثانية`)
  return parts.join(' ')
}
export default handler
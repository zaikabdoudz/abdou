const handler = async (m, { conn, args }) => {
  const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => null) : null
  const groupParticipants = groupMetadata?.participants || []
  const mentions = groupParticipants.map(p => p.phoneNumber || p.jid || p.id).filter(Boolean).map(id => conn.decodeJid(id))
  const userText = (args.join(' ') || '').trim()
  const src = m.quoted || m
  const hasImage = Boolean(src.message?.imageMessage || src.mtype === 'imageMessage')
  const hasVideo = Boolean(src.message?.videoMessage || src.mtype === 'videoMessage')
  const hasAudio = Boolean(src.message?.audioMessage || src.mtype === 'audioMessage')
  const hasSticker = Boolean(src.message?.stickerMessage || src.mtype === 'stickerMessage')
  const isQuoted = Boolean(m.quoted)
  const originalText = (src.caption || src.text || src.body || '').trim()
  try {
    if (hasImage || hasVideo) {
      const media = await src.download()
      if (hasImage) return conn.sendMessage(m.chat, { image: media, ...(isQuoted ? { caption: originalText } : { caption: userText }), mentions }, { quoted: null })
      return conn.sendMessage(m.chat, { video: media, mimetype: 'video/mp4', ...(isQuoted ? { caption: originalText } : { caption: userText }), mentions }, { quoted: null })
    }
    if (hasAudio) {
      const media = await src.download()
      return conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mp4', mentions }, { quoted: null })
    }
    if (hasSticker) {
      const media = await src.download()
      return conn.sendMessage(m.chat, { sticker: media, mentions }, { quoted: null })
    }
    if (isQuoted && originalText) return conn.sendMessage(m.chat, { text: originalText, mentions }, { quoted: null })
    if (userText) return conn.sendMessage(m.chat, { text: userText, mentions }, { quoted: null })
    return m.reply(`《✧》 أرسل نصاً أو رد على رسالة`)
  } catch (e) {
    return m.reply(`> حدث خطأ: *${e.message}*`)
  }
}
handler.help = ['تاق_مخفي <نص>', 'تاق_مخفي (بالرد)']
handler.tags = ['group']
handler.command = /^(تاق_مخفي|hidetag|tag)$/i
handler.admin = true
handler.group = true
export default handler
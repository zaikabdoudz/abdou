import fetch from 'node-fetch'

const defaultImage = 'https://qu.ax/ueisS.IPG'

// تفعيل وتعطيل الترحيب
let handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 هذا الأمر مخصص للجروبات فقط.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (type !== 'welcome') return m.reply('🌿 استخدم:\n*.on welcome* / *.off welcome*')

  if (!(isAdmin || isOwner)) return m.reply('❌ هذا الأمر للمشرفين فقط.')

  chat.welcome = enable
  return m.reply(`✅ تم ${enable ? 'تفعيل' : 'إيقاف'} الترحيب والمغادرة بنجاح.`)
}

handler.command = ['on', 'off']
handler.group = true
handler.tags = ['group']
handler.help = ['on welcome', 'off welcome']

// نظام الترحيب والمغادرة
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return

  if ([27, 28, 32].includes(m.messageStubType)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject
    const groupDesc = groupMetadata.desc || "لا يوجد وصف للمجموعة 🌿"
    const groupSize = groupMetadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userMention = `@${userId.split('@')[0]}`
    let profilePic = defaultImage

    try {
      // 👇 هذا الجزء هو المفتاح، يستخدم fallback موثوق أكثر
      profilePic = await conn.profilePictureUrl(userId, 'image')
        .catch(async () => await conn.profilePictureUrl(userId, 'preview'))
        .catch(() => defaultImage)
      if (!profilePic) profilePic = defaultImage
    } catch {
      profilePic = defaultImage
    }

    // 🟢 رسالة الترحيب
    if (m.messageStubType === 27) {
      const welcomeText = `
╮═────═⌘═────═╭
🌿 ↜ *مـنـور يٓـا* ${userMention}
🏷️ ↜ *اسـم الـجـروب:* ${groupName}
👥 ↜ *عـدد الاعـضـاء الان:* ${groupSize}
╯═────═⌘═────═╰
 𝙰𝚁𝚃_𝙱𝙾𝚃
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: welcomeText,
        mentions: [userId],
      })
    }

    // 🔴 رسالة المغادرة
    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const byeText = `
╮═────═⌘═────═╭
🌿 ↜ *لـقًـد غـادر عـضـو الـمـجـمـوعـه*
🏷️ ↜ *اسـم الـمـجـمـوعـه:* ${groupName}
👤 ↜ *مـنـشـن الـشـخص:* ${userMention}
👥 ↜ *عـدد الاعـضـاء الان:* ${groupSize}
╯═────═⌘═────═╰
𝙰𝚁𝚃_𝙱𝙾𝚃
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: byeText,
        mentions: [userId],
      })
    }
  }
}

export default handler
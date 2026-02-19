const handler = async (m, { conn, chat }) => {
  const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => {}) : null
  if (!groupMetadata) return m.reply('《✧》 تعذر جلب بيانات المجموعة.')
  const groupName = groupMetadata.subject
  const groupBanner = await conn.profilePictureUrl(m.chat, 'image').catch(() => global.banner || '')
  const groupCreator = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : 'غير معروف'
  const groupAdmins = groupMetadata?.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin') || []
  const totalParticipants = groupMetadata.participants.length
  const chatUsers = chat.users || {}
  let totalCoins = 0, registeredUsersInGroup = 0
  groupMetadata.participants.forEach(participant => {
    const fullId = participant.phoneNumber || participant.jid || participant.id
    const user = chatUsers[fullId]
    if (user) { registeredUsersInGroup++; totalCoins += Number(user.coins) || 0 }
  })
  const settings = {
    bot: chat.isBanned ? '✘ مغلق' : '✓ مفعل',
    antiLink: chat.antiLink ? '✓ مفعل' : '✘ مغلق',
    welcome: chat.welcome ? '✓ مفعل' : '✘ مغلق',
    goodbye: chat.goodbye ? '✓ مفعل' : '✘ مغلق',
    detect: chat.detect ? '✓ مفعل' : '✘ مغلق',
    gacha: chat.gacha ? '✓ مفعل' : '✘ مغلق',
    economy: chat.economy ? '✓ مفعل' : '✘ مغلق',
    nsfw: chat.nsfw ? '✓ مفعل' : '✘ مغلق',
    modoadmin: chat.modoadmin ? '✓ مفعل' : '✘ مغلق',
  }
  let message = `*「✿」مجموعة ◢ ${groupName} ◤*\n\n`
  message += `➪ *المالك ›* ${groupCreator}\n`
  message += `♤ المشرفون › *${groupAdmins.length}*\n`
  message += `❒ الأعضاء › *${totalParticipants}*\n`
  message += `ꕥ المسجلون › *${registeredUsersInGroup}*\n`
  message += `⛁ العملات › *${totalCoins.toLocaleString()} ${global.currency || ''}*\n\n`
  message += `➪ *الإعدادات:*\n`
  message += `✐ البوت › *${settings.bot}*\n`
  message += `✐ مضاد الروابط › *${settings.antiLink}*\n`
  message += `✐ الترحيب › *${settings.welcome}*\n`
  message += `✐ الوداع › *${settings.goodbye}*\n`
  message += `✐ التنبيهات › *${settings.detect}*\n`
  message += `✐ الغاتشا › *${settings.gacha}*\n`
  message += `✐ الاقتصاد › *${settings.economy}*\n`
  message += `✐ NSFW › *${settings.nsfw}*\n`
  message += `✐ وضع الأدمن › *${settings.modoadmin}*`
  const mentions = groupMetadata.owner ? [groupMetadata.owner] : []
  try {
    await conn.sendMessage(m.chat, { image: { url: groupBanner }, caption: message.trim(), mentions }, { quoted: m })
  } catch {
    await conn.reply(m.chat, message.trim(), m, { mentions })
  }
}
handler.help = ['معلومات_المجموعة', 'gp']
handler.tags = ['group']
handler.command = /^(معلومات_المجموعة|gp|groupinfo)$/i
handler.group = true
export default handler
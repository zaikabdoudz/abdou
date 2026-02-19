const handler = async (m, { conn, args, usedPrefix, command, chat }) => {
  const botname = global.botname || 'البوت'
  const stateArg = args[0]?.toLowerCase()
  const mapTerms = {
    antilinks: 'antiLink', antienlaces: 'antiLink', antilink: 'antiLink',
    'مضاد_روابط': 'antiLink',
    welcome: 'welcome', bienvenida: 'welcome', 'ترحيب': 'welcome',
    goodbye: 'goodbye', despedida: 'goodbye', 'وداع': 'goodbye',
    alerts: 'detect', alertas: 'detect', 'تنبيهات': 'detect',
    economy: 'economy', economia: 'economy', 'اقتصاد': 'economy',
    adminonly: 'modoadmin', onlyadmin: 'modoadmin', 'فقط_الادمن': 'modoadmin',
    nsfw: 'nsfw',
    rpg: 'gacha', gacha: 'gacha'
  }
  const featureNames = {
    antiLink: '*مضاد الروابط*', welcome: 'رسائل *الترحيب*',
    goodbye: 'رسائل *الوداع*', detect: '*التنبيهات*',
    economy: 'أوامر *الاقتصاد*', gacha: 'أوامر *الغاتشا*',
    modoadmin: 'وضع *الأدمن فقط*', nsfw: 'أوامر *NSFW*'
  }
  const normalizedKey = mapTerms[command] || mapTerms[command?.toLowerCase()] || command
  const current = chat[normalizedKey] === true
  const estado = current ? '✓ مفعل' : '✗ مغلق'
  const nombre = featureNames[normalizedKey] || `الخاصية *${normalizedKey}*`
  if (!stateArg) {
    return conn.reply(m.chat, `*✩ ${nombre} (✿❛◡❛)*\n\nꕥ يمكن للأدمن تفعيل أو إيقاف ${nombre} بـ:\n\n● _تفعيل ›_ *${usedPrefix + command} on*\n● _إيقاف ›_ *${usedPrefix + command} off*\n\n❒ *الحالة الحالية ›* ${estado}`, m)
  }
  if (!['on', 'off', 'enable', 'disable'].includes(stateArg)) {
    return m.reply(`✎ استخدم *on* أو *off*\n\nمثال:\n${usedPrefix}${command} on`)
  }
  const enabled = ['on', 'enable'].includes(stateArg)
  if (chat[normalizedKey] === enabled) return m.reply(`✎ ${nombre} كانت *${enabled ? 'مفعلة' : 'مغلقة'}* بالفعل.`)
  chat[normalizedKey] = enabled
  return m.reply(`✎ تم *${enabled ? 'تفعيل' : 'إيقاف'}* ${nombre}.`)
}
handler.help = ['ترحيب on/off', 'وداع on/off', 'تنبيهات on/off', 'nsfw on/off', 'اقتصاد on/off', 'فقط_الادمن on/off']
handler.tags = ['group']
handler.command = /^(welcome|ترحيب|goodbye|وداع|alerts|تنبيهات|nsfw|antilink|مضاد_روابط|economy|اقتصاد|gacha|adminonly|فقط_الادمن|bienvenida|despedida|antilinks)$/i
handler.admin = true
handler.group = true
export default handler
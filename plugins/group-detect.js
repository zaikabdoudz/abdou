let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

export async function before(m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return
const fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:𝙰𝙱𝙳𝙾𝚄\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net"}  
let chat = global.db.data.chats[m.chat]
let usuario = `@${m.sender.split('@')[0]}`
let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://qu.ax/QGAVS.jpg'  

// ✅ إصلاح: استخراج الرقم من messageStubParameters بشكل صح
// BailMod ممكن يرجع string عادي أو object أو JID
function extractNumber(param) {
  if (!param) return '?'
  // لو string عادي زي "9665XXXXXXX@s.whatsapp.net"
  if (typeof param === 'string') {
    // لو فيه @ استخرج الرقم قبله
    if (param.includes('@')) return param.split('@')[0]
    // لو رقم مباشرة
    return param
  }
  // لو object (BailMod الجديد)
  if (typeof param === 'object') {
    return param.id?.split('@')[0] || param.jid?.split('@')[0] || param.number || JSON.stringify(param)
  }
  return String(param)
}

function extractJid(param) {
  if (!param) return ''
  if (typeof param === 'string') {
    if (param.includes('@')) return param
    return param + '@s.whatsapp.net'
  }
  if (typeof param === 'object') {
    return param.jid || param.id || (param.number + '@s.whatsapp.net') || ''
  }
  return String(param)
}

const stub0 = m.messageStubParameters?.[0]
const stub0Num = extractNumber(stub0)
const stub0Jid = extractJid(stub0)

let nombre, foto, edit, newlink, status, admingp, noadmingp
nombre = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اسـم الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍⇇الاسـم الـجـديـد↶*\n❍⇇┊${stub0}┊\n*❍━━━══━━❪🌸❫━━══━━━❍*`
foto = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر صوره الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
edit = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اعدادات الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n❍⇇${stub0 == 'on' ? '*لادمن-فقط*' : 'الجميع'} *من يمكنهم التحدث*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
newlink = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر رابط الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
status = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اعدادات الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n❍⇇${stub0 == 'on' ? '*لادمن-فقط*' : 'الجميع'} *من يمكنهم التحدث*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
// ✅ استخدام stub0Num بدل split مباشرة
admingp = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تم ترقيه↜❪@${stub0Num}❫*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍↜مبارك لك الترقيه🐤👏*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
noadmingp = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تم اعفاء↜❪@${stub0Num}❫*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍↜للاسف تم اعفائك من رتبتك😔💔*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

if (chat.detect && m.messageStubType == 21) {
await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })   

} else if (chat.detect && m.messageStubType == 22) {
await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })

} else if (chat.detect && m.messageStubType == 23) {
await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })    

} else if (chat.detect && m.messageStubType == 25) {
await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })  

} else if (chat.detect && m.messageStubType == 26) {
await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })  

} else if (chat.detect && m.messageStubType == 29) {
// ✅ استخدام stub0Jid للـ mentions
await conn.sendMessage(m.chat, { text: admingp, mentions: [m.sender, stub0Jid] }, { quoted: fkontak })  
return

} 
if (chat.detect && m.messageStubType == 30) {
await conn.sendMessage(m.chat, { text: noadmingp, mentions: [m.sender, stub0Jid] }, { quoted: fkontak })  

} else {
console.log({ messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType]})
}}

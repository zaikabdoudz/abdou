const _baileys = await import('@whiskeysockets/baileys')
const WAMessageStubType = _baileys.WAMessageStubType || _baileys.default?.WAMessageStubType || {}

export async function before(m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return

const fkontak = {
  key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
  message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:𝙰𝙱𝙳𝙾𝚄\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }},
  participant: "0@s.whatsapp.net"
}

let chat = global.db.data.chats[m.chat]
if (!chat) return

let usuario = `@${m.sender.split('@')[0]}`
let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || global.banner || ''

// ✅ إصلاح: استخراج رقم الهاتف من messageStubParameters
// BailMod يرجع object أو string أو @lid
function extractStubJid(param) {
  if (!param) return null
  // لو object
  if (typeof param === 'object') {
    const raw = param.jid || param.id || param.lid || ''
    param = raw
  }
  // لو string @lid نبحث عن phoneNumber في participants
  if (typeof param === 'string' && param.includes('@lid')) {
    const lidNum = param.split('@')[0]
    const found = (groupMetadata?.participants || []).find(
      p => (p.id || '').split('@')[0] === lidNum
    )
    if (found?.phoneNumber) return found.phoneNumber
    // fallback: نرجع كما هو
    return param
  }
  // لو رقم عادي أو @s.whatsapp.net
  return param
}

function extractStubNum(param) {
  const jid = extractStubJid(param)
  if (!jid) return '?'
  return jid.split('@')[0]
}

const stub0 = m.messageStubParameters?.[0]
const stub0Jid = extractStubJid(stub0)
const stub0Num = extractStubNum(stub0)

let nombre, foto, edit, newlink, status, admingp, noadmingp

nombre = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اسـم الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍⇇الاسـم الـجـديـد↶*\n❍⇇┊${stub0 || ''}┊\n*❍━━━══━━❪🌸❫━━══━━━❍*`

foto = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر صوره الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

// ✅ إصلاح: كان فيه + بدل $ في template literal
edit = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اعدادات الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n❍⇇${stub0 == 'on' ? '*لادمن-فقط*' : 'الجميع'} *من يمكنهم التحدث*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

newlink = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر رابط الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

status = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اعدادات الـمـجـمـوعـه*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n❍⇇${stub0 == 'on' ? '*لادمن-فقط*' : 'الجميع'} *من يمكنهم التحدث*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

admingp = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تم ترقيه↜❪@${stub0Num}❫*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍↜مبارك لك الترقيه🐤👏*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

noadmingp = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تم اعفاء↜❪@${stub0Num}❫*\n*❍⇇بـواسـطـة↜❪${usuario}❫*\n*❍↜للاسف تم اعفائك من رتبتك😔💔*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

try {
  if (chat.detect && m.messageStubType == 21) {
    await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 22) {
    if (pp) {
      await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })
    } else {
      await conn.sendMessage(m.chat, { text: foto, mentions: [m.sender] }, { quoted: fkontak })
    }

  } else if (chat.detect && m.messageStubType == 23) {
    await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 25) {
    await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 26) {
    await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 29) {
    // ✅ mentions تستخدم phoneNumber مو @lid
    const mentions = [m.sender, stub0Jid].filter(Boolean)
    await conn.sendMessage(m.chat, { text: admingp, mentions }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 30) {
    const mentions = [m.sender, stub0Jid].filter(Boolean)
    await conn.sendMessage(m.chat, { text: noadmingp, mentions }, { quoted: fkontak })

  } else {
    console.log('[group-detect] stub:', {
      messageStubType: m.messageStubType,
      messageStubParameters: m.messageStubParameters,
      type: WAMessageStubType[m.messageStubType] || 'unknown'
    })
  }
} catch (e) {
  console.error('[group-detect] error:', e.message)
}
}

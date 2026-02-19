let handler = async (m, { conn, usedPrefix, text, isAdmin, isOwner }) => {
if (!isAdmin && !isOwner) return conn.reply(m.chat, '*[❗] هذا الأمر مخصص للمشرفين فقط!*', m)

if (!text && !m.quoted) return conn.reply(m.chat, `*[❗] الاستخدام الصحيح:*\n\n*┯┷*\n*┠≽ ${usedPrefix}ترقيه @منشن*\n*┠≽ ${usedPrefix}ترقيه (بالرد على رسالة)*\n*┷┯*`, m)

let user
try {
  if (m.quoted?.sender) {
    user = m.quoted.sender
  } else if (text) {
    // ✅ استخرج الرقم سواء من mention أو نص مباشر
    let number = text.replace(/[^0-9]/g, '')
    if (!number) return conn.reply(m.chat, `*[❗] الرجاء إدخال رقم أو منشن صالح!*`, m)
    if (number.length > 15 || number.length < 7) return conn.reply(m.chat, `*[⚠️] الرقم غير صحيح!*`, m)
    user = number + '@s.whatsapp.net'
  }

  if (!user) return conn.reply(m.chat, `*[❗] لم يتم تحديد المستخدم!*`, m)

  await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
  await conn.reply(m.chat, `✅ تمت ترقية @${user.split('@')[0]} بنجاح إلى مشرف!`, m, { mentions: [user] })
} catch (e) {
  console.error(e)
  await conn.reply(m.chat, `*[❌] فشلت العملية: ${e.message}*`, m)
}
}

handler.help = ['ترقيه @منشن', 'ترقيه (بالرد)'].map(v => v)
handler.tags = ['group']
handler.command = /^(ترقيه|رفع|ارفع)$/i
handler.group = true
handler.botAdmin = true

export default handler

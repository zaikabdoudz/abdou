// لعبة تهكير (نسخة مبسطة، بدون تحديثات متكررة أو حذف رسائل)
const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

let handler = async (m, { conn }) => {
  // تحديد الهدف: منشن أو رد أو المرسل نفسه
  const target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || m.sender
  if (!target) return conn.reply(m.chat, '✖️ منشن أو رد على الشخص لتشغيل المزحة.', m)

  const mentionJid = target
  const mention = `@${mentionJid.split('@')[0]}`

  // رسالة البداية (مرسلة مرة واحدة فقط)
  const startText = `جـاري الـتـهـكـير ☠️..\n\n[▱▱▱▱▱▱▱▱▱▱] 0%`
  await conn.sendMessage(m.chat, { text: startText }, { quoted: m })

  // ننتظر مدة قصيرة (عشوائية بين 3 - 7 ثواني) ثم نرسل النتيجة النهائية
  const waitMs = 3000 + Math.floor(Math.random() * 4000)
  await sleep(waitMs)

  // النتائج العشوائية
  const picsSent = Math.floor(Math.random() * 100) + 1
  const weeks = Math.floor(Math.random() * 100) + 1

  const finalText = `
╮─── ⸙｡⋆ ︶︶ ︶︶ ───╭
*جـاري انهاء العمليه ☠️..*

لـقـد تـم تـهـكـيـر ${mention}
عـدد الـصـور الـي اتـرسـلت للـمـطور ☠️ : ${picsSent}
عـدد الاسـابـيـع (تقرير) : ${weeks}

╯─── ⸙｡⋆ ︶︶ ︶︶ ───╰

لـقـد تـم الإخـتـراق ☠️..
`.trim()

  await conn.sendMessage(m.chat, { text: finalText, contextInfo: { mentionedJid: [mentionJid] } }, { quoted: m })
}

handler.help = ['تهكير']
handler.tags = ['fun']
handler.command = /^تهكير$/i

export default handler
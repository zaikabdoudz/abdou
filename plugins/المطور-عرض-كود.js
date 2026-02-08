// تـم الـتـطـويـر بـواسـطـه عــبــدو🌿💚

import fs from 'fs'
import path from 'path'

// ❄️ الأرقام المسموح لها باستخدام الأمر
const allowedNumbers = [
  '213540419314@s.whatsapp.net',
  '213774297599@s.whatsapp.net'
]

const basePath = 'plugins'

const handler = async (m, { conn, text }) => {
  const emoji = '❄️'

  // 🔒 التحقق من الصلاحية
  if (!allowedNumbers.includes(m.sender)) {
    await conn.reply(m.chat, `${emoji} ⇦ ≺غـيـر مـسـمـوح لـك بـهـذا الأمـر يـا عــبــد❌🌿≺`, m)
    return
  }

  // 📂 قراءة ملفات مجلد plugins
  const files = fs.readdirSync(basePath).filter(f => f.endsWith('.js'))

  // 🧠 إذا ما كتب اسم ملف أو رقم
  if (!text) {
    if (files.length === 0) {
      await conn.reply(m.chat, `${emoji} ⇦ ≺مـجـلـد الـبـلـقـيـن فـاضـي يـا عــبــدو📂😅≺`, m)
      return
    }

    const list = files.map((f, i) => `${i + 1}. ${f}`).join('\n')
    await conn.reply(
      m.chat,
      `
╮──⊰ [📜 قـائـمـة الـمـلـفـات] ⊱──╭
${list}
╯──⊰ ❄️ ⊱──╰

${emoji} ⇦ ≺ارسـل رقـم الـمـلـف أو اسـمـه لـعـرضـه يـا عــبــدو🌿≺
      `.trim(),
      m
    )
    return
  }

  // 🔎 تحديد الملف المطلوب
  let filename
  const index = parseInt(text.trim()) - 1

  if (!isNaN(index) && index >= 0 && index < files.length) {
    filename = files[index]
  } else {
    const inputName = text.trim().toLowerCase()
    const targetName = inputName.endsWith('.js') ? inputName : `${inputName}.js`
    filename = files.find(f => f.toLowerCase() === targetName)
  }

  if (!filename) {
    await conn.reply(m.chat, `${emoji} ⇦ ≺الـمـلـف غـيـر مـوجـود يـا بـابـا❌≺`, m)
    return
  }

  // 📖 قراءة محتوى الملف
  const filePath = path.join(basePath, filename)
  let content
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch (e) {
    await conn.reply(m.chat, `${emoji} ⇦ ≺فـشـل فـي قـراءة الـمـلـف "${filename}"😔≺`, m)
    return
  }

  // ✅ إرسال محتوى الملف
  await conn.reply(
    m.chat,
    `
╮──⊰ [📂 ${filename}] ⊱──╭
${content.slice(0, 4000)} 
╯──⊰ ❄️ ⊱──╰

${emoji} ⇦ ≺هـذا هـو مـحـتـوى الـمـلـف يـا عــبــدو🌿≺
    `.trim(),
    m
  )
}

handler.help = ['عرض-كود *<اسم أو رقم>*']
handler.tags = ['owner']
handler.command = /^(getplugin|عرض-كود|gp|باتش-عرض)$/i

export default handler
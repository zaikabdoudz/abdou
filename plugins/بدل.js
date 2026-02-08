// تـم الـتـطـويـر بـواسـطـه مـونـتـي ❄️💚

import fs from 'fs'
import path from 'path'

// ❄️ الأرقام المسموح لها بتنفيذ الأمر
const allowedNumbers = [
  '213540419314@s.whatsapp.net',
  '213774297599@s.whatsapp.net'
]

const handler = async (m, { conn, text }) => {
  const emoji = '❄️'
  
  // 🔒 التحقق من الصلاحية
  if (!allowedNumbers.includes(m.sender)) {
    await conn.reply(m.chat, `${emoji} ⇦ ≺غـيـر مـسـمـوح لـك بـهـذا الأمـر يـا عــبــد❌🌿≺`, m)
    return
  }

  // 🧠 التحقق من التنسيق
  if (!text || !text.includes('|')) {
    await conn.reply(
      m.chat,
      `${emoji} ⇦ ≺اكـتـب الأمـر بـهـذا الـشـكـل يـا عــبــدو💡≺\n\n*.بدل كلمه_قديمه|كلمه_جديده*`,
      m
    )
    return
  }

  const [oldWord, newWord] = text.split('|').map(s => s.trim())
  if (!oldWord || !newWord) {
    await conn.reply(m.chat, `${emoji} ⇦ ≺تـأكـد مـن كـتـابـة الكـلـمـتـيـن بـشـكـل صـحـيـح يـا عــبــدو😅≺`, m)
    return
  }

  const basePath = 'plugins'
  const files = fs.readdirSync(basePath).filter(file => file.endsWith('.js'))
  let changedFiles = 0
  let errors = []

  await conn.reply(m.chat, `${emoji} ⇦ ≺جـاري اسـتـبـدال "${oldWord}" بـ "${newWord}" فـي الـمـلـفـات🛠️🌿≺`, m)

  // 🔄 عملية الاستبدال
  for (let file of files) {
    const filePath = path.join(basePath, file)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (content.includes(oldWord)) {
        const newContent = content.split(oldWord).join(newWord)
        fs.writeFileSync(filePath, newContent, 'utf-8')
        changedFiles++
      }
    } catch (err) {
      errors.push({ file, error: err.message })
    }
  }

  // ✅ النتيجة النهائية
  let msg = `
╮──⊰ ❄️ ⊱──╭
${emoji} ⇦ ≺تـم اسـتـبـدال "${oldWord}" بـ "${newWord}" بـنـجـاح يـا عــبــدو🩵≺
🌿 ⇦ ≺عـدد الـمـلـفـات الـمـتـغـيـره : ${changedFiles}≺
╯──⊰ ❄️ ⊱──╰
`

  if (errors.length > 0) {
    msg += `\n⚠️ ⇦ ≺وجـدت أخـطـاء فـي بـعـض الـمـلـفـات:≺\n`
    errors.forEach(({ file, error }) => {
      msg += `📄 ${file}\n💢 ${error}\n`
    })
  }

  await conn.reply(m.chat, msg.trim(), m)
}

handler.help = ['بدل <قديم>|<جديد>']
handler.tags = ['owner']
handler.command = /^بدل$/i

export default handler
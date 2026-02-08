// تـم الـتـطـويـر بـواسـطـه عــبــدو 💚

import fs from 'fs'

// 🌿 أرقام الأونر
const allowedNumbers = [
  '213540419314@s.whatsapp.net',
  '213774297599@s.whatsapp.net'
]

const handler = async (m, { conn }) => {
  // التحقق من صلاحية الأونر
  if (!allowedNumbers.includes(m.sender)) {
    await conn.reply(m.chat, '❄️ ⇦ ≺غـيـر مـسـمـوح لـك يـا عبـد 😂🌿≺', m)
    return
  }

  // قراءة الملفات من مجلد البلوجنز
  const pluginFolder = './plugins'
  const files = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'))

  if (files.length === 0) {
    await conn.reply(m.chat, '📂 ⇦ ≺مـا فـي أي بـلوجـنـات مـوجـوده يـا عــبــدو😅≺', m)
    return
  }

  // تنسيق القائمة بالزخرفة المطلوبة
  let message = `🌿✨ *قـائـمـه الـمـلفـات* ✨🌿\n`
  message += `عـدد الـبـلوجـن يـا عــبــدو 🌿🌹\n`
  message += `〘 ${files.length} بـلوجـن 〙\n`
  message += `︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹\n`

  files.forEach((file, index) => {
    message += `📂 〘 ${file.replace('.js', '')} 〙〘 ${index + 1} 〙\n`
  })

  message += `︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹`

  await conn.reply(m.chat, message, m)
}

// ✅ التعريف
handler.help = ['قائمةالملفات']
handler.tags = ['owner']
handler.command = /^(قائمةالملفات|قائمهالملفات|قائمة_الملفات|قائمة)$/i

export default handler
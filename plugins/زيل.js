// تم التطوير بواسطة مونتي 💚
import fs from 'fs'
import path from 'path'

// 🌿 أرقام الأونر
const allowedNumbers = [
  '213540419314@s.whatsapp.net',
  '213774297599@s.whatsapp.net'
]

const handler = async (m, { conn, text }) => {
  // 🧩 تحقق من الصلاحية
  if (!allowedNumbers.includes(m.sender)) {
    await conn.reply(m.chat, '🏦 ⇦ ≺غـيـر مـسـمـوح لـك يـا عبـد 😂❄️≺', m)
    return
  }

  if (!text) {
    await conn.reply(m.chat, '🏦 ⇦ ≺اكـتـب رقـم الـمـلـف أو اسـمـه يـا بـابـا✍️❄️≺', m)
    return
  }

  // 🔍 مسار مجلد البلوجنز
  const pluginDir = path.resolve('./plugins')
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'))

  // ⚙️ تحقق إذا المستخدم كتب رقم أو اسم
  let targetFile = null

  if (!isNaN(text)) {
    // رقم الملف
    const index = parseInt(text) - 1
    targetFile = files[index]
  } else {
    // اسم الملف
    targetFile = files.find(f => f.startsWith(text)) || `${text}.js`
  }

  const fullPath = path.join(pluginDir, targetFile)

  // 🔥 تنفيذ الحذف
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
    await conn.reply(
      m.chat,
      `🏦 ⇦ ≺تـم حـذف الـمـلـف بـنـجـاح❄️≺\n\n🧩 ⇦ ≺اسـم الـمـلـف: ${targetFile}≺`,
      m
    )
  } else {
    await conn.reply(
      m.chat,
      `🏦 ⇦ ≺الـمـلـف مـش مـوجـود😢❄️≺\n📁 ⇦ ≺المسار: ${fullPath}≺`,
      m
    )
  }
}

handler.help = ['امسح <رقم أو اسم>']
handler.tags = ['owner']
handler.command = /^زيل$/i


export default handler
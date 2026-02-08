// تـم الـتـطـويـر بـواسـطـه عــبــدو❄️👑 💚

import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.reply(m.chat, '❄️ ⇦ ≺اكـتـب الـكـلـمـه الـي تـبـحـث عـنـهـا يـا عــبــدو❄️✍️≺', m)
    return
  }

  await conn.reply(m.chat, '❄️ ⇦ ≺جـاري الـبـحـث فـي الـمـلـفـات يـا عــبــدو🔍🌸≺', m)

  const basePath = 'plugins'
  const files = fs.readdirSync(basePath).filter(file => file.endsWith('.js'))
  const matchedResults = []
  const fileReadErrors = []

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i]
    const filePath = path.join(basePath, fileName)

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const fileLines = fileContent.split('\n')

      fileLines.forEach((line, index) => {
        if (line.includes(text)) {
          matchedResults.push({
            fileIndex: i + 1,
            fileName,
            lineNumber: index + 1,
            lineContent: line.trim(),
          })
        }
      })
    } catch (error) {
      fileReadErrors.push({ fileName, error: error.message })
    }
  }

  if (matchedResults.length > 0) {
    let response = `
❄️ ⇦ ≺تـم الـعـثـور عـلـى "${text}" فـي هـذه الـمـلفـات💚≺
___________________________
`
    matchedResults.forEach(({ fileIndex, fileName, lineNumber, lineContent }) => {
      response += `
📂 ⇦ ≺رقـم الـكـود : ${fileIndex}≺
📄 ⇦ ≺اسـم الـمـلـف : ${fileName}≺
🔢 ⇦ ≺رقـم الـسـطـر : ${lineNumber}≺
🌿 ⇦ ≺الـسـطـر : ${lineContent}≺
___________________________
`
    })

    await conn.reply(m.chat, response.trim(), m)
  } else {
    let msg = `❄️ ⇦ ≺مـا لـقـيـت "${text}" فـي أي مـلـف يـا عــبــدو😢≺`

    if (fileReadErrors.length > 0) {
      msg += '\n\n⚠️ ⇦ ≺وجـدت أخـطـاء أثـنـاء قـراءة بـعـض الـمـلـفـات:≺\n'
      fileReadErrors.forEach(({ fileName, error }) => {
        msg += `📄 ${fileName} → ${error}\n`
      })
    }

    await conn.reply(m.chat, msg.trim(), m)
  }
}

handler.help = ['كشف <الكلمة>']
handler.tags = ['owner']
handler.command = /^1كشف$/i

export default handler
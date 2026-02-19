function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender] || {}
  let name = conn.getName ? conn.getName(m.sender) : (user.name || 'مستخدم')

  await conn.sendMessage(m.chat, { react: { text: '📂', key: m.key } })

  const randomImage = [
    'https://i.ibb.co/4wg51yy4/ace035324a42aaef69b3d28dab574bee.jpg',
    'https://i.ibb.co/YFTWFRT8/1e84a843b8a32f999071924613ba1cf2.jpg'
  ][Math.floor(Math.random() * 2)]

  const menuText = `
*⨷↵┆ قـائـمـة الأوامـر ┆↯*
*〄━━═⏣⊰ •⚡• ⊱⏣═━━〄*

*🜋↜┆ _🃜 أهلاً بـك_*
*❍↜┆*_🃚 اسـم الـبـوت ↯_
 *⌞ 𝙰𝚛𝚝_𝚋𝚘𝚝 ⌝*
*❆━━━═⏣⊰🎲⊱⏣═━━━❆*

*☉↵┆ _🃁 مـسـتـواك :_* ⚡ ${user.level || 0}
*☉↵┆ _🂭 اسـمك :_* ${user.registered ? `*${user.name}*` : '*سجّل الآن لتبدأ رحلتك ⚡*'}
*❀ ═══ •『🍁』• ═══ ❀*
          *_~𝙰𝚛𝚝_𝚋𝚘𝚝~_*
*_〘مصمم من طرف〙_*  
*𝙰𝙱𝙳𝙾𝚄 🩸*
`.trim()

  // ✅ الطريقة الصحيحة: استخدام sendNCarousel من simple.js
  // المعاملات: jid, text, footer, buffer, buttons, copy, urls, list, quoted
  await conn.sendNCarousel(
    m.chat,
    menuText,
    '',              // footer
    randomImage,     // صورة الهيدر
    [                // buttons: [display_text, id]
      ['『🩸┇المـطـور┇🩸』', '.المطور'],
    ],
    null,            // copy
    [                // urls: [display_text, url]
      ['『⚡┇قـنـاة البـوت┇⚡』', 'https://whatsapp.com/channel/0029VbCBbYA5q08hEVYjXD2f'],
    ],
    [                // list: [title, sections]
      [
        '『❄️┇قائمة الأوامر الرئيسية┇❄️』',
        [
          {
            title: '❄️ ⇦ الأقسام المتاحة ❄️',
            rows: [
              { title: '𓋜   ق1 ⇦ قـسـم الألـعـاب  ❄️',          id: '.ق1' },
              { title: '𓋜   ق2 ⇦ قـسـم الـصـور  ❄️',            id: '.ق2' },
              { title: '𓋜   ق3 ⇦ قـسـم الـمـجـمـوعـات  ❄️',     id: '.ق3' },
              { title: '𓋜   ق4 ⇦ قـسـم الـتـحـويـلات  ❄️',      id: '.ق4' },
              { title: '𓋜   ق5 ⇦ قـسـم الـتـحـمـيـلات  ❄️',     id: '.ق5' },
              { title: '𓋜   ق6 ⇦ قـسـم الـبـنـك  ❄️',           id: '.ق6' },
              { title: '𓋜   ق7 ⇦ قـسـم الـذكـاء الاصطناعي  ❄️', id: '.ق7' },
              { title: '𓋜   ق8 ⇦ قـسـم الألـقـاب  ❄️',          id: '.ق8' },
              { title: '𓋜   ق9 ⇦ قـسـم الـمـزاح  ❄️',           id: '.ق9' },
              { title: '𓋜   ق10 ⇦ قـسـم الـمـطـور  ❄️',         id: '.ق10' },
            ]
          }
        ]
      ]
    ],
    m  // quoted
  )
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['اوامر', 'الاوامر', 'menu', 'المهام']

export default handler

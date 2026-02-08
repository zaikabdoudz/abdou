import pkg from '@whiskeysockets/baileys'
const { prepareWAMessageMedia } = pkg

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender] || {}
  let name = conn.getName(m.sender) || 'مستخدم'
  await conn.sendMessage(m.chat, { react: { text: '📂', key: m.key } })

  const images = [
    'https://files.catbox.moe/ziws8j.jpg',
    'https://files.catbox.moe/57nt4f.jpg'
  ]
  const randomImage = images[Math.floor(Math.random() * images.length)]
  const messa = await prepareWAMessageMedia({ image: { url: randomImage } }, { upload: conn.waUploadToServer })

  const menuText = `
*⨷↵┆ قـائـمـة الأوامـر ┆↯*
*〄━━═⏣⊰ •⚡• ⊱⏣═━━〄*

*🜋↜┆ _🃜 أهلاً بـك_*
*❍↜┆*_🃚 اسـم الـبـوت ↯_
 *⌞ 𝙰𝚁𝚃_𝙱𝙾𝚃 ⌝*
*❆━━━═⏣⊰🎲⊱⏣═━━━❆*

*☉↵┆ _🃁 مـسـتـواك :_* ⚡ ${user.level || 0}
*☉↵┆ _🂭 اسـمك :_* ${user.registered ? `*${user.name}*` : '*سجّل الآن لتبدأ رحلتك ⚡*'}
*❀ ═══ •『🍁』• ═══ ❀*
          *_~𝙰𝚁𝚃_𝙱𝙾𝚃~_*
*_〘مصمم من طرف〙_*  
*𝙰𝙱𝙳𝙾𝚄 🩸*
`;

const buttons = [
  {
    name: "single_select",
    buttonParamsJson: JSON.stringify({
      title: '『❄️┇قائمة الأوامر الرئيسية┇❄️』',
      sections: [
        {
          title: '❄️ ⇦ الأقسام المتاحة ❄️',
          rows: [
            { title: '𓋜   ق1 ⇦ قـسـم الألـعـاب  ❄️', id: '.ق1' },
            { title: '𓋜   ق2 ⇦ قـسـم الـصـور  ❄️', id: '.ق2' },
            { title: '𓋜   ق3 ⇦ قـسـم الـمـجـمـوعـات  ❄️', id: '.ق3' },
            { title: '𓋜   ق4 ⇦ قـسـم الـتـحـويـلات  ❄️', id: '.ق4' },
            { title: '𓋜   ق5 ⇦ قـسـم الـتـحـمـيـلات  ❄️', id: '.ق5' },
            { title: '𓋜   ق6 ⇦ قـسـم الـبـنـك  ❄️', id: '.ق6' },
            { title: '𓋜   ق7 ⇦ قـسـم الـذكـاء الاصطناعي  ❄️', id: '.ق7' },
            { title: '𓋜   ق8 ⇦ قـسـم الألـقـاب  ❄️', id: '.ق8' },
            { title: '𓋜   ق9 ⇦ قـسـم الـمـزاح  ❄️', id: '.ق9' },
            { title: '𓋜   ق10 ⇦ قـسـم الـمـطـور  ❄️', id: '.ق10' }
          ]
        }
      ]
    })
  },
  {
    // باقي الأزرار ...
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "『🩸┇المـطـور┇🩸』",
        id: ".المطور"
      })
    },
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "『⚡┇قـنـاة البـوت┇⚡』",
        url: "https://whatsapp.com/channel/0029VbCBbYA5q08hEVYjXD2f",
        merchant_url: "https://whatsapp.com/channel/0029VbCBbYA5q08hEVYjXD2f"
      })
    }
  ]

  await conn.relayMessage(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: menuText },
          header: {
            title: '',
            hasMediaAttachment: true,
            imageMessage: messa.imageMessage
          },
          nativeFlowMessage: { buttons }
        }
      }
    }
  }, {})
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['اوامر', 'الاوامر', 'menu', 'المهام']

export default handler
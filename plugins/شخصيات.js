// ===[ Characters Menu - تصميم ملكي مطابق للقائمة الأساسية ]===
import pkg from '@whiskeysockets/baileys'
const { prepareWAMessageMedia } = pkg

// القوائم
const characterLists = {
  list1: [
    { name: 'ساسكي', emoji: '⚔️', command: 'sasuke' },
    { name: 'ناروتو', emoji: '🍥', command: 'naruto' },
    { name: 'ساغيري', emoji: '🎀', command: 'sagiri' },
    { name: 'نيزوكو', emoji: '🎋', command: 'nezuko' },
    { name: 'ساكورا', emoji: '🌸', command: 'sakura' },
    { name: 'ميناتو', emoji: '⚡', command: 'minato' },
    { name: 'مادارا', emoji: '🔥', command: 'madara' },
    { name: 'كوتوري', emoji: '🐦', command: 'kotori' }
  ],
  list2: [
    { name: 'كاغورا', emoji: '🎐', command: 'kagura' },
    { name: 'كاغا', emoji: '💥', command: 'kaga' },
    { name: 'ايتوري', emoji: '🐦', command: 'itori' },
    { name: 'ايتاشي', emoji: '🌑', command: 'itachi' },
    { name: 'ايسوزي', emoji: '🌀', command: 'isuzu' },
    { name: 'اينوري', emoji: '🎤', command: 'inori' },
    { name: 'هيستيا', emoji: '✨', command: 'hestia' },
    { name: 'نوبارا', emoji: '🪄', command: 'nobara' }
  ],
  list3: [
    { name: 'ايرزا', emoji: '🔥', command: 'erza' },
    { name: 'ايميليا', emoji: '❄️', command: 'emilia' },
    { name: 'ايلاينا', emoji: '🌙', command: 'elaina' },
    { name: 'ايبا', emoji: '🎴', command: 'eba' },
    { name: 'ديدرا', emoji: '💀', command: 'deidara' },
    { name: 'كوسبلاي', emoji: '🎭', command: 'cosplay' },
    { name: 'شيهو', emoji: '🌸', command: 'chiho' },
    { name: 'ميكو', emoji: '🎤', command: 'miku' }
  ]
}

const handler = async (m, { conn, usedPrefix }) => {
  await conn.sendMessage(m.chat, { react: { text: '🖤', key: m.key } })

  // صورة القائمة
  const imgUrl = 'https://files.catbox.moe/wo4zhx.jpg'
  const media = await prepareWAMessageMedia({ image: { url: imgUrl } }, { upload: conn.waUploadToServer })

  // نص القائمة — نفس ستايل قائمة الأوامر
  const caption = `
*⨷↵┆ قـائـمـة شخـصـيـات الأنـمـي ┆↯*
*〄━━═⏣⊰ •⚡• ⊱⏣═━━〄*

اختر الشخصية التي تريدها من القوائم أدناه

*❆━━━═⏣⊰🎭⊱⏣═━━━❆*
          *_~𝙰𝚁𝚃_𝙱𝙾𝚃~_*
*_〘مصمم من طرف〙_*  
*𝙰𝙱𝙳𝙾𝚄 🩸*
`;

  // تحويل القوائم إلى nativeFlow sections
  const sectionBuilder = (title, list) => ({
    title,
    rows: list.map(c => ({
      title: `${c.emoji} ${c.name}`,
      description: "اضغط لعرض الصور",
      id: `${usedPrefix}${c.command}`
    }))
  })

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "القائمة الأولى",
        sections: [sectionBuilder("القائمة 1 — الأكثر طلبًا", characterLists.list1)]
      })
    },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "القائمة الثانية",
        sections: [sectionBuilder("القائمة 2 — ترند الأسبوع", characterLists.list2)]
      })
    },
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "القائمة الثالثة",
        sections: [sectionBuilder("القائمة 3 — كلاسيكيات الأنمي", characterLists.list3)]
      })
    }
  ]

  await conn.relayMessage(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: {
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          },
          body: { text: caption },
          footer: { text: "𝙰𝚁𝚃𝙷𝚄𝚁_𝙱𝙾𝚃" },
          nativeFlowMessage: { buttons }
        }
      }
    }
  }, { messageId: m.key.id })
}

handler.help = ['شخصيات']
handler.tags = ['anime']
handler.command = /^(شخصيات|انمي|characters)$/i

export default handler
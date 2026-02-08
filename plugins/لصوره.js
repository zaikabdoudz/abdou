import { webp2png } from '../lib/webp2mp4.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Readable } from 'stream';

async function toBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const notStickerMessage = `✳️ قم بالرد على ملصق بـ:\n\n *${usedPrefix + command}*`
    if (!m.quoted) throw notStickerMessage

    const q = m.quoted
    const type = Object.keys(q.message || {})[0] // نوع الرسالة
    if (type !== 'stickerMessage') throw notStickerMessage

    try {
        // تنزيل الملصق
        const stream = await downloadContentFromMessage(q.message.stickerMessage, 'sticker')
        const buffer = await toBuffer(stream)

        // تحويل إلى PNG
        const out = await webp2png(buffer).catch(_ => null)
        if (!out || out.length === 0) throw '❌ حدث خطأ أثناء التحويل'

        // إرسال الصورة مع الحفاظ على زخرفة النصوص
        await conn.sendFile(
            m.chat,
            out,
            'out.png',
            `*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*\n*｢🍨｣⇇تـم تـنـفـيـذ طـلـبـك*\n*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*`,
            m
        )
    } catch (e) {
        m.reply('❌ لم يتم التحويل، تأكد من أن الملصق صالح.')
        console.log(e)
    }
}

handler.help = ['toimg <sticker>']
handler.tags = ['sticker']
handler.command = ['لصوره', 'jpg', 'aimg']

export default handler
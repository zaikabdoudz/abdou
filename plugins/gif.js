// plugins/graisticker.js
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args }) => {
    let stiker = false
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.dev
    let texto2 = packstickers.text2 || global.author

    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        let txt = args.join(' ')

        // التأكد من نوع الميديا
        if (/gif|webp|image|video/g.test(mime) && q.download) {
            let buffer = await q.download()  // تحميل الميديا

            if (/video/.test(mime) && ((q.msg || q).seconds || 0) > 10)
                return conn.reply(m.chat, '❌ الفيديو لا يمكن أن يزيد عن *10 ثانية*', m)

            await m.react('🕓')
            let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
            stiker = await sticker(buffer, false, marca[0], marca[1])

        } else if (args[0] && isUrl(args[0])) {
            let buffer = await sticker(false, args[0], texto1, texto2)
            stiker = buffer
        } else {
            return conn.reply(m.chat, '❗ أرسل GIF أو فيديو قصير لتحويله لستيكر.', m)
        }

    } catch (e) {
        await conn.reply(m.chat, '⚠ حدث خطأ: ' + e.message, m)
        await m.react('✖️')
    } finally {
        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await m.react('✅')
        }
    }
}

handler.help = ['غراي']
handler.tags = ['sticker']
handler.command = ['غراي']

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}
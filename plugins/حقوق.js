import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
    if (!m.quoted) throw 'لازم ترد على الاستيكر اللي تريد تعديل حقوقه!'

    let stiker = false
    try {
        // استخدام الإعدادات العالمية من settings
        const packname = global.botname || ''
        const author = global.author || ''

        let mime = m.quoted.mimetype || ''
        if (!/webp/.test(mime)) throw 'الرد يجب أن يكون على استيكر بصيغة webp.'
        let img = await m.quoted.download()
        if (!img) throw 'حدث خطأ أثناء تحميل الاستيكر، حاول مرة أخرى.'

        stiker = await addExif(img, packname, author)
    } catch (e) {
        console.error(e)
        if (Buffer.isBuffer(e)) stiker = e
    } finally {
        if (stiker) {
            conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, { asSticker: true })
        } else {
            throw 'حدث خطأ! تأكد أنك رديت على استيكر صالح.'
        }
    }
}

handler.help = ['حقوق']
handler.tags = ['sticker']
handler.command = /^حقوق|سرقة$/i
export default handler
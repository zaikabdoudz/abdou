import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return conn.reply(m.chat, '❀ الرجاء إدخال كلمة بحث أو رابط تيك توك.', m)
const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
try {
await m.react('🕒')
if (isUrl) {
const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
const data = res.data?.data;
if (!data?.play) return conn.reply(m.chat, 'ꕥ الرابط غير صالح أو لا يحتوي على محتوى قابل للتحميل.', m)
const { title, duration, author, created_at, type, images, music, play } = data
const caption = createCaption(title, author, duration, created_at)
if (type === 'image' && Array.isArray(images)) {
const medias = images.map(url => ({ type: 'image', data: { url }, caption }));
await conn.sendSylphy(m.chat, medias, { quoted: m })
if (music) {
await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp4' }, { quoted: m })
}} else {
await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
}} else {
const res = await axios({ method: 'POST', url: 'https://tikwm.com/api/feed/search', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Cookie': 'current_language=en', 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36' }, data: { keywords: text, count: 20, cursor: 0, HD: 1 }})
const results = res.data?.data?.videos?.filter(v => v.play) || []
if (results.length < 2) return conn.reply(m.chat, 'ꕥ مطلوب على الأقل نتيجتين صالحتين مع محتوى.', m)
const medias = results.slice(0, 5).map(v => ({ type: 'video', data: { url: v.play }, caption: createSearchCaption(v) }))
await conn.sendSylphy(m.chat, medias, { quoted: m })
}
await m.react('✔️')
} catch (e) {
await m.react('✖️')
await conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`, m)
}}
function createCaption(title, author, duration, mSender) {
  return `❀ *العنوان ›* *𝚗𝚘𝚝𝚑𝚒𝚗𝚐  ||* '\n` +
         `> ☕︎ المؤلف › * *𝙱𝚈 𝙰𝙱𝙳𝙾𝚄*'\n` +
         `© mᥲძᥱ ᥕі𝗍һ ᑲᥡ 𝙰𝙱𝙳𝙾𝚄`;
}

function createSearchCaption(data, mSender) {
  return `❀ *العنوان ›* *𝚗𝚘𝚝𝚑𝚒𝚗𝚐  ||* '\n` +
         `> ☕︎ المؤلف › * *𝙱𝚈 𝙰𝙱𝙳𝙾𝚄*'\n` +
         `© mᥲძᥱ ᥕі𝗍һ ᑲᥡ 𝙰𝙱𝙳𝙾𝚄`;
}

handler.help = ['tiktok', 'tt']
handler.tags = ['downloader']
handler.command = ['تيك', 'تيك توك', 'تيكتوك', 'تكتوك']
handler.group = true

export default handler
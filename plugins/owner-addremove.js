import db from '../lib/database.js'
import MessageType from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, args, command, isROwner }) => {
if (!isROwner) return
try {
const now = Date.now()
const user = global.db.data.users
let mentionedJid = await m.mentionedJid
let who = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
switch (command) {
case 'اضف_عملات': {
if (!who) return m.reply('❀ الرجاء تحديد المستخدم أو الرد على رسالته.')
const coinTxt = text.replace(/^@\S+\s*/, '').trim().split(' ')[0]
if (!coinTxt) return m.reply(`ꕥ الرجاء إدخال عدد العملات المراد إضافتها.`)
if (isNaN(coinTxt)) return m.reply(`ꕥ يُسمح بالأرقام فقط.`)
await m.react('🕒')
const dmt = parseInt(coinTxt)
const impts = 0
const pjkC = Math.ceil(dmt * impts)
if (dmt + pjkC < 1) return m.react('✖️'), m.reply(`ꕥ الحد الأدنى هو *1*`)
user[who].coin += dmt
await m.react('✔️')
m.reply(`❀ *تمت الإضافة:*\n» ${dmt} \n@${who.split('@')[0]}، تلقيت ${dmt} عملة`, null, { mentions: [who] })
break
}
case 'اضف_xp': {
if (!who) return m.reply('❀ الرجاء تحديد المستخدم أو الرد على رسالته.')
const xpTxt = text.replace(/^@\S+\s*/, '').trim().split(' ')[0]
if (!xpTxt) return m.reply(`ꕥ الرجاء إدخال مقدار الخبرة (XP) المراد إضافتها.`)
if (isNaN(xpTxt)) return m.reply(`ꕥ يُسمح بالأرقام فقط.`)
await m.react('🕒')
const xp = parseInt(xpTxt)
const pajak = 0
const pjkX = Math.ceil(xp * pajak)
if (xp + pjkX < 1) return m.react('✖️'), m.reply(`ꕥ الحد الأدنى للخبرة (XP) هو *1*`)
user[who].exp += xp
await m.react('✔️')
m.reply(`❀ تم إضافة الخبرة: *${xp}* \n@${who.split('@')[0]}، تلقيت ${xp} XP`, null, { mentions: [who] })
break
}
case 'اضف_بريميوم': {
if (!who) return m.reply('❀ الرجاء تحديد المستخدم أو الرد على رسالته.')
if (!user[who]) user[who] = { premiumTime: 0, premium: false }
const premArgs = text.split(' ').filter(arg => arg)
if (premArgs.length < 2) return m.reply('ꕥ أرسل وقتًا صالحًا\n> مثال (1h, 2d, 3s, 4m).')
await m.react('🕒')
let tiempo = 0
const cant = parseInt(premArgs[0])
const unidad = premArgs[1]
if (unidad === 'h') tiempo = 3600000 * cant
else if (unidad === 'd') tiempo = 86400000 * cant
else if (unidad === 's') tiempo = 604800000 * cant
else if (unidad === 'm') tiempo = 2592000000 * cant
else return m.react('✖️'), m.reply('ꕥ وقت غير صالح.\nالخيارات:\n h = ساعات، d = أيام، s = أسابيع، m = أشهر')
user[who].premiumTime = now < user[who].premiumTime ? user[who].premiumTime + tiempo : now + tiempo
user[who].premium = true
const timeLeft = await formatTime(user[who].premiumTime - now)
await m.react('✔️')
m.reply(`✰ مستخدم بريميوم جديد!!!\n\nᰔᩚ المستخدم » @${who.split('@')[0]}\nⴵ مدة البريميوم » ${cant}${unidad}\n✧ الوقت المتبقي » ${timeLeft}`, null, { mentions: [who] })
break
}
case 'حذف_بريميوم': {
if (!who) return m.reply('❀ الرجاء تحديد المستخدم أو الرد على رسالته.')  
if (!user[who]?.premiumTime) return m.react('✖️'), m.reply('ꕥ المستخدم ليس بريميوم.')
await m.react('🕒')
user[who].premiumTime = 0
user[who].premium = false
await m.react('✔️')
m.reply(`❀ @${who.split('@')[0]} لم يعد مستخدم بريميوم.`, null, { mentions: [who] })
break
}
case 'قائمة_بريميوم': {
await m.react('🕒')
const perm = (global.prems || []).map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v !== conn.user.jid)
const listaPermanentes = perm.map(v => `│ المستخدم: @${v.replace(/@.+/, '')}`).join('\n')
const userList = Object.entries(user).filter(([_, v]) => v.premiumTime).map(([key, value]) => ({ ...value, jid: key }))
const sorted = userList.sort((a, b) => a.premiumTime - b.premiumTime)
const len = args[0] ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sorted.length)
const listaTemporales = await Promise.all(sorted.slice(0, len).map(async ({ jid, premiumTime }) => {
return `┌─⊷ \n│ المستخدم: @${jid.split('@')[0]}\n│ تنتهي في: ${premiumTime > 0 ? await formatTime(premiumTime - now) : 'انتهت'}\n└───────────`
}))
const textList = `≡ بريميوم دائم\n\n❖ المجموع: ${perm.length}\n┌─⊷\n${listaPermanentes}\n└───────────\n\n≡ مستخدمو بريميوم\n❖ المجموع: ${sorted.length} \n${listaTemporales.join('\n')}`
const mentions = [...perm, ...sorted.slice(0, len).map(({ jid }) => jid)]
await m.react('✔️')
conn.reply(m.chat, textList, m, { mentions })
break
}}} catch (error) {
m.reply(`⚠︎ حدثت مشكلة.\n> استخدم ${command} report للإبلاغ عنها.\n\n${error.message}`)
}}

handler.help = ['اضف_عملات', 'اضف_xp', 'اضف_بريميوم', 'حذف_بريميوم', 'قائمة_بريميوم']
handler.tags = ['owner']
handler.command = ['اضف_عملات', 'اضف_xp', 'اضف_بريميوم', 'حذف_بريميوم', 'قائمة_بريميوم']

export default handler

async function formatTime(ms) {
let s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
let months = Math.floor(d / 30), weeks = Math.floor((d % 30) / 7)
s %= 60; m %= 60; h %= 24; d %= 7
let t = months ? [`${months} شهر${months > 1 ? 'ان' : ''}`] :
weeks ? [`${weeks} أسبوع${weeks > 1 ? 's' : ''}`] :
d ? [`${d} يوم${d > 1 ? 's' : ''}`] : []
if (h) t.push(`${h} ساعة${h > 1 ? 's' : ''}`)
if (m) t.push(`${m} دقيقة${m > 1 ? 's' : ''}`)
if (s) t.push(`${s} ثانية${s > 1 ? 's' : ''}`)
return t.length > 1 ? t.slice(0, -1).join(' ') + ' و ' + t.slice(-1) : t[0]
}
import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import path from 'path'
import { fileURLToPath } from 'url'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

// ✅ إصلاح: مسار مطلق للملفات المحلية
const __dirname = path.dirname(fileURLToPath(import.meta.url))

var handler = m => m
handler.all = async function (m) { 
global.canalIdM = ["120363424796176668@newsletter", "120363424796176668@newsletter"]
global.canalNombreM = ["ᥫ᭡ 𝙰𝚁𝚃𝙷𝚄𝚁 𝑾𝒂𝑩𝒐𝒕 - 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝑪𝒉𝒂𝒏𝒏𝒆𝒍 ᯓᡣ𐭩", "ᥫ᭡ 𝙰𝚁𝚃𝙷𝚄𝚁 𝑾𝒂𝑩𝒐𝒕 - 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝑪𝒉𝒂𝒏𝒏𝒆𝒍 ᯓᡣ𐭩"]
global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
global.mes = d.toLocaleDateString('es', {month: 'long'})
global.año = d.toLocaleDateString('es', {year: 'numeric'})
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

var canal = 'https://whatsapp.com/channel/0029VbCBbYA5q08hEVYjXD2f'  
var comunidad = 'https://chat.whatsapp.com/CvWNDXXjw1J8K7y92bPycz'
var git = 'https://github.com/zaikabdou'
var github = '.' 
var correo = 'abdozaik620@gmail.com'
global.redes = [canal, comunidad, git, github, correo].getRandom()

global.nombre = m.pushName || 'Anónimo'
global.packsticker = `°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°\nᰔᩚ Usuario: ${nombre}\n❀ Bot: ${botname}\n✦ Fecha: ${fecha}\nⴵ Hora: ${moment.tz('America/Caracas').format('HH:mm:ss')}`
global.packsticker2 = `\n°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°\n\n${dev}`

// ✅ إصلاح: بدل fetch على ملف محلي، نستخدم fs.readFileSync مباشرة
const iconoPath = typeof icono === 'string' && !icono.startsWith('http') 
  ? path.resolve(__dirname, '..', icono.replace('./', ''))
  : icono

let iconoBuffer
try {
  if (typeof iconoPath === 'string' && iconoPath.startsWith('http')) {
    iconoBuffer = await (await fetch(iconoPath)).buffer()
  } else {
    iconoBuffer = fs.readFileSync(iconoPath)
  }
} catch {
  iconoBuffer = Buffer.alloc(0)
}

global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

// ✅ إصلاح: استخدام iconoBuffer بدل fetch(icono)
global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, externalAdReply: { title: botname, body: dev, mediaUrl: null, description: null, previewType: "PHOTO", thumbnail: iconoBuffer, sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }, mentionedJid: null }}
}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}

import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"
import path from "path"
import { createRequire } from "module"

// ✅ إصلاح المسارات - نستخدم مسار مطلق بدل نسبي
const __dirname = path.dirname(fileURLToPath(import.meta.url))

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.botNumber = ""

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = ["213774297599", "213540419314"]
global.suittag = ["213540419314"] 
global.prems = ["213540419314"]

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2|Latest"
global.nameqr = "CLAUS-MD"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.yukiJadibts = true

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.botname = "𝙰𝚁𝚃_𝙱𝙾𝚃"
global.textbot = "BY 『 𝙰𝙱𝙳𝙾𝚄 』"
global.dev = "© ⍴᥆ᥕᥱrᥱძ ᑲᥡ 𝙰𝙱𝙳𝙾𝚄"
global.author = "© mᥲძᥱ ᥕі𝗍һ ᑲᥡ 𝙰𝙱𝙳𝙾𝚄"
global.etiqueta = "𝙰𝙱𝙳𝙾𝚄"
global.currency = "𝙰𝚁𝚃𝙷𝚄𝚁"
global.banner = "https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742678744381.jpeg"

// ✅ إصلاح: استخدام مسار مطلق بدل نسبي
global.icono = path.join(__dirname, './lib/arthur.jpg')
global.catalogo = (() => {
  try {
    return fs.readFileSync(path.join(__dirname, './lib/catalogo.jpg'))
  } catch {
    return Buffer.alloc(0) // إذا الملف ما موجود، يرجع buffer فارغ بدل ما يكرش
  }
})()

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.group = "https://chat.whatsapp.com/Bnb3NCKIpJR5eCTvjudukc"
global.community = "https://chat.whatsapp.com/Bnb3NCKIpJR5eCTvjudukc"
global.channel = "https://chat.whatsapp.com/Bnb3NCKIpJR5eCTvjudukc"
global.github = "https://github.com/The-King-Destroy/YukiBot-MD"
global.gmail = "abdozaik620@gmail.com"
global.ch = {
  ch1: "120363424796176668@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.APIs = {
  adonix: {
    url: "https://api-adonix.ultraplus.click",
    key: "Yuki-WaBot"
  },
  vreden: {
    url: "https://api.vreden.web.id",
    key: null
  },
  nekolabs: {
    url: "https://api.nekolabs.web.id",
    key: null
  },
  siputzx: {
    url: "https://api.siputzx.my.id",
    key: null
  },
  delirius: {
    url: "https://api.delirius.store",
    key: null
  },
  ootaizumi: {
    url: "https://api.ootaizumi.web.id",
    key: null
  },
  stellar: {
    url: "https://api.stellarwa.xyz",
    key: "YukiWaBot",
    key2: "1bcd4698ce6c75217275c9607f01fd99"
  },
  apifaa: {
    url: "https://api-faa.my.id",
    key: null
  },
  xyro: {
    url: "https://api.xyro.site",
    key: null
  },
  yupra: {
    url: "https://api.yupra.my.id",
    key: null
  },
  zenzxz: {
    url: "https://api.zenzxz.my.id",
    key: null
  }
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})

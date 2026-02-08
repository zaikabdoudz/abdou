let wait = "⏳ جارِ إنشاء الشعار..."
import axios from "axios"
import fetch from "node-fetch"
import cheerio from 'cheerio'
import { JSDOM } from "jsdom"

let handler = async (m, { conn, text }) => {
    if (!text) throw "هذا الامر خاص بعمل شعارات باسمك \nمثال:\n*.لوجو*\n> 𝙰𝚁𝚃_𝙱𝙾𝚃"

    try {
        await m.reply("⏳ جارِ إنشاء الشعار...")

        let res = await BrandCrowd(text)

        if (!res.length) throw "ما لقيت نتائج… جرّب كلمة ثانية."

        let rdm = res[Math.floor(Math.random() * res.length)]

        await conn.sendMessage(
            m.chat,
            {
                image: { url: rdm },
                caption: "[ النتيجة ]"
            },
            { quoted: m }
        )

    } catch (e) {
        console.log(e)
        throw "صار خطأ أثناء جلب الشعار."
    }
}

handler.help = ["لوجو"]
handler.tags = ["logo"]
handler.command = /^لوجو$/i

export default handler

/* New Line */
async function BrandCrowd(query) {

    let url = `https://www.brandcrowd.com/maker/logos/page1?Text=${encodeURIComponent(query)}&TextChanged=true&SearchText&KeywordChanged=true&LogoStyle=0&FontStyles&Colors&FilterByTags`

    // نجبر الموقع يعطينا HTML كامل
    let res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    })

    let html = await res.text()

    // cheerio أفضل من jsdom في الصفحات الثقيلة
    let $ = cheerio.load(html)
    let img = []

    $("img").each((i, el) => {
        let src = $(el).attr("data-src") || $(el).attr("src")
        if (src && src.startsWith("https://dynamic.brandcrowd.com")) {
            img.push(src)
        }
    })

    return img.filter(Boolean)
}
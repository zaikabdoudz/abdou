import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"
import axios from "axios"
import fetch from "node-fetch"

const handler = async (m, { conn, command, usedPrefix, text, args }) => {
try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    const username = await (async () => global.db.data.users[m.sender].name || 
        (async () => { 
            try { 
                const n = await conn.getName(m.sender); 
                return typeof n === 'string' && n.trim() ? n : m.sender.split('@')[0] 
            } catch { 
                return m.sender.split('@')[0] 
            } 
        })()
    )()

    switch (command) {

        case 'داللي': {
            if (!args[0]) return conn.reply(m.chat, `❀ الرجاء إدخال وصف لتوليد الصورة.`, m)
            const promptDalle = args.join(' ')
            if (promptDalle.length < 5) return conn.reply(m.chat, `❀ الوصف قصير جدًا.`, m)
            await m.react('🕒')
            const dalleURL = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(promptDalle)}`
            const dalleRes = await axios.get(dalleURL, { responseType: 'arraybuffer' })
            await conn.sendMessage(m.chat, { image: Buffer.from(dalleRes.data) }, { quoted: m })
            await m.react('✔️')
            break
        }

        case 'فلكس': {
            if (!text) return conn.reply(m.chat, `❀ الرجاء إدخال كلمة لتوليد الصورة.`, m)
            await m.react('🕒')
            const result = await fluximg.create(text)
            if (result?.imageLink) {
                await conn.sendMessage(m.chat, { image: { url: result.imageLink }, caption: `❀ *نتيجة لـ:* ${text}` }, { quoted: m })
                await m.react('✔️')
            } else throw new Error("❌ لم يتم إنشاء الصورة")
            break
        }

        case 'ذكاء': case 'تشات': {
            if (!text) return conn.reply(m.chat, `❀ الرجاء إدخال الطلب.`, m)
            await m.react('🕒')
            const basePrompt = `اسمك هو ${botname} وتم إنشاؤك بواسطة ${etiqueta}. إصدارك الحالي ${vs}. تتحدث اللغة العربية. ستخاطب الأشخاص باسم ${username}. تحب المرح والتعلم، والأهم أن تكون ودودًا مع من تتحدث إليه.`
            const url = `${global.APIs.delirius.url}/ia/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(basePrompt)}`
            const res = await axios.get(url)
            if (!res.data?.status || !res.data?.data) throw new Error('❌ استجابة غير صالحة من Delirius')
            await conn.sendMessage(m.chat, { text: res.data.data }, { quoted: m })
            await m.react('✔️')
            break
        }

        case 'لوميناي': case 'جيميني': case 'بارد': {
            if (!text) return conn.reply(m.chat, `❀ الرجاء إدخال الطلب.`, m)
            await m.react('🕒')
            const apiMap = { 'لوميناي': 'qwen-qwq-32b', 'جيميني': 'gemini', 'بارد': 'grok-3-mini' }
            const endpoint = apiMap[command]
            const url = `${global.APIs.zenzxz.url}/ai/${endpoint}?text=${encodeURIComponent(text)}`
            const res = await axios.get(url)
            const output = res.data?.response || res.data?.assistant
            if (!res.data?.status || !output) throw new Error(`❌ استجابة غير صالحة من ${command}`)
            await conn.sendMessage(m.chat, { text: output }, { quoted: m })
            await m.react('✔️')
            break
        }

        case 'صوت': case 'ايفويس': case 'فوذيا': {
            if (!text) return conn.reply(m.chat, `❀ الرجاء إدخال النص الذي تريد تحويله إلى صوت بواسطة الذكاء الاصطناعي.`, m)
            await m.react('🕒')
            const apiURL = `${global.APIs.adonix.url}/ai/iavoz?apikey=${global.APIs.adonix.key}&q=${encodeURIComponent(text)}&voice=Jorge`
            const response = await axios.get(apiURL, { responseType: 'arraybuffer' })
            await conn.sendMessage(m.chat, { audio: Buffer.from(response.data), mimetype: 'audio/mpeg' }, { quoted: m })
            await m.react('✔️')
            break
        }

    }
} catch (error) {
    await m.react('✖️')
    conn.reply(m.chat, `⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${error.message}`, m)
}}

handler.command = ['جيميني', 'بارد', 'اوپن اي', 'داللي', 'فلكس', 'ذكاء', 'تشات', 'لوميناي', 'صوت', 'ايفويس', 'فوذيا']
handler.help = ['جيميني', 'بارد', 'اوپن اي', 'داللي', 'فلكس', 'ذكاء', 'تشات', 'لوميناي', 'صوت', 'ايفويس', 'فوذيا']
handler.tags = ['tools']
handler.group = true

export default handler

const fluximg = { 
    defaultRatio: "2:3", 
    create: async (query) => {
        const config = { headers: { accept: "*/*", authority: "1yjs1yldj7.execute-api.us-east-1.amazonaws.com", "user-agent": "Postify/1.0.0" }}
        const url = `https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${encodeURIComponent(query)}&aspect_ratio=${fluximg.defaultRatio}`
        const res = await axios.get(url, config)
        return { imageLink: res.data.image_link }
    }
}
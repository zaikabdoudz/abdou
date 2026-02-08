import axios from "axios";
import cheerio from "cheerio";
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default;

const base = "https://www.pinterest.com";
const search = "/resource/BaseSearchResource/get/";

const headers = {
    'accept': 'application/json, text/javascript, /, q=0.01',
    'referer': 'https://www.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'x-app-version': 'a9522f',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/[username]/[slug].js',
    'x-requested-with': 'XMLHttpRequest'
};

async function getCookies() {
    try {
        const response = await axios.get(base);
        const setHeaders = response.headers['set-cookie'];
        if (setHeaders) {
            const cookies = setHeaders.map(cookieString => cookieString.split(';')[0].trim()).join('; ');
            return cookies;
        }
        return null;
    } catch (error) {
        console.error("خطأ أثناء جلب الكوكيز:", error);
        return null;
    }
}

async function searchPinterest(query) {
    if (!query) {
        return { status: false, message: "يرجى إدخال كلمة بحث صحيحة!" };
    }

    try {
        const cookies = await getCookies();
        if (!cookies) {
            return { status: false, message: "فشل في استرجاع الكوكيز، حاول مرة أخرى لاحقًا." };
        }

        const params = {
            source_url: `/search/pins/?q=${query}`,
            data: JSON.stringify({
                options: { isPrefetch: false, query, scope: "pins", bookmarks: [""], page_size: 10 },
                context: {}
            }),
            _: Date.now()
        };

        const { data } = await axios.get(`${base}${search}`, { headers: { ...headers, 'cookie': cookies }, params });

        const results = data.resource_response.data.results.filter(v => v.images?.orig);
        if (results.length === 0) {
            return { status: false, message: `لم يتم العثور على نتائج لكلمة البحث، اسف ابحث مرة اخرى: ${query}` };
        }

        return {
            status: true,
            pins: results.map(result => ({
                id: result.id,
                title: result.title || "بدون عنوان",
                description: result.description || "بدون وصف",
                pin_url: `https://pinterest.com/pin/${result.id}`,
                image: result.images.orig.url,
                uploader: {
                    username: result.pinner.username,
                    full_name: result.pinner.full_name,
                    profile_url: `https://pinterest.com/${result.pinner.username}`
                }
            }))
        };

    } catch (error) {
        return { status: false, message: "حدث خطأ أثناء البحث، حاول مرة أخرى لاحقًا." };
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*\n**┃ ❌ مثال: ${usedPrefix + command} cat cing**\n*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*`);
    }

    await m.reply('*جـاري الـبـحث 🥷*\n*┃ 🔎 الرجاء الانتظار قليلاً...*\n*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*');

    async function createImage(url) {
        const { imageMessage } = await generateWAMessageContent({
            image: { url }
        }, { upload: conn.waUploadToServer });
        return imageMessage;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let result = await searchPinterest(text);
    if (!result.status) {
        return m.reply(`*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*\n**┃ ${result.message}**\n*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*`);
    }

    let pins = result.pins.slice(0, 10);
    shuffleArray(pins);

    let push = [];
    let i = 1;
    for (let pin of pins) {
        let imageUrl = pin.image;
        push.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `*╮ ⊰✫⊱─⊰✫⊱─⊰✫⊱╭*\n*┃ ${pin.title}*\n*┃\n*┘⊰✫⊱─⊰✫⊱─⊰✫⊱└*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: '*𝙰𝚁𝚃_𝙱𝙾𝚃*'
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `**الصورة ${i++}**`,
                hasMediaAttachment: true,
                imageMessage: await createImage(imageUrl)
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                    {
                        "name": "cta_url",
                        "buttonParamsJson": {"display_text":"عرض على Pinterest","url":`${pin.pin_url}`}
                    }
                ]
            })
        });
    }

    const bot = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: '*︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹*\n**┃ اسـتـمـتـع بـمـا طـلـبـت  🥷**\n︶꒷꒦︶ ⭑ ...︶꒷꒦︶ ⭑ ...⊹'
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: '𝙰𝚁𝚃_𝙱𝙾𝚃'
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: false
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards: [...push]
                    })
                })
            }
        }
    }, {});

    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
};

handler.help = ['pinterest'];
handler.tags = ['downloader'];
handler.command = /^(pinterest|pin|صوره-بين|بينتيريست|بينترست|بينتريست)$/i;
handler.limit = true;

export default handler;
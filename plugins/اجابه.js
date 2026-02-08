import similarity from 'similarity'

const threshold = 0.72

export async function before(m) {

    let id = m.chat

    if (!m.quoted || !m.quoted.fromMe || !m.text || !/استخدم.*انسحب/i.test(m.quoted.text) || /.*hhint/i.test(m.text))
        return !0

    this.tebakbendera = this.tebakbendera ? this.tebakbendera : {}

    if (!(id in this.tebakbendera))
        return this.reply(m.chat, '🔥🔥🔥 𝓣𝓱𝓮 𝓖𝓪𝓶𝓮 𝓔𝓷𝓭𝓮𝓭 🔥🔥🔥\n*┊ ❪🍄❫⇇السؤال خلصان من بدري 🐤🐤*\n🔥🔥🔥', m)

    if (m.quoted.id == this.tebakbendera[id][0].id) {

        let isSurrender = /^(انسحب|surr?ender)$/i.test(m.text)

        if (isSurrender) {

            clearTimeout(this.tebakbendera[id][3])
            delete this.tebakbendera[id]

            return this.reply(m.chat, '🔥💥🔥 𝓢𝓾𝓻𝓻𝓮𝓷𝓭𝓮𝓻 🔥💥🔥\n*┊ ❪🍄❫⇇كنت ممكن تكسب لو فكرت شويه 🐤🐤*\n🔥💥🔥', m)
        }

        let json = JSON.parse(JSON.stringify(this.tebakbendera[id][1]))

        if (m.text.toLowerCase() == json.name.toLowerCase().trim()) {

            global.db.data.users[m.sender].exp += this.tebakbendera[id][2]

            this.reply(m.chat, `🔥✨🔥 𝓒𝓸𝓷𝓰𝓻𝓪𝓽𝓼 🔥✨🔥\n*┊ ❪🍄❫⇇مبروك الايجابه صح🐤👏*\n*┊ ❪🍄❫⇇الجائزه ⇇ ❪${this.tebakbendera[id][2]}❫*\n🔥✨🔥`, m)

            clearTimeout(this.tebakbendera[id][3])
            delete this.tebakbendera[id]

        } else if (similarity(m.text.toLowerCase(), json.name.toLowerCase().trim()) >= threshold)

            m.reply('🔥⚡🔥 𝓢𝓸 𝓒𝓵𝓸𝓼𝓮! 🔥⚡🔥\n*┊ ❪🍄❫⇇قربت من الايجابه يا عثليه 🐤🐤*\n🔥⚡🔥')

        else
            this.reply(m.chat, '💔🔥💥 𝓦𝓻𝓸𝓷𝓰 🔥💥💔\n*┊ ❪🍄❫⇇اجابتك غلط يا مز/ه🐤💔*\n💔🔥💥', m)
    }

    return !0
}

export const exp = 0
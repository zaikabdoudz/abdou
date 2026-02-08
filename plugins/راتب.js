let handler = async (m, { conn }) => {
    // التحقق من وجود بيانات المستخدم
    let user = global.db.data.users[m.sender]
    if (!user) global.db.data.users[m.sender] = {
        lastcofre: 0,
        limit: 0,
        money: 0,
        joincount: 0,
        exp: 0
    }

    if (!user.lastcofre) user.lastcofre = 0
    let time = user.lastcofre + 86400000 // 24 ساعة

    // التحقق من مرور 24 ساعة
    if (new Date - user.lastcofre < 86400000) 
        return m.reply(`🏦 ⇦ لقد أخذت هديتك اليومية بالفعل.\n\n⏳ انتظر *${msToTime(time - new Date())}* قبل أن تطلبها مجددًا.`)

    // الجوائز العشوائية 🎁
    let img = 'https://img.freepik.com/vector-gratis/cofre-monedas-oro-piedras-preciosas-cristales-trofeo_107791-7769.jpg?w=2000'
    let dia = Math.floor(Math.random() * 30)
    let tok = Math.floor(Math.random() * 10)
    let mystic = Math.floor(Math.random() * 4000)
    let expp = Math.floor(Math.random() * 5000)

    // إضافة الجوائز
    user.limit += dia
    user.money += mystic
    user.joincount += tok
    user.exp += expp
    user.lastcofre = new Date * 1

    // النص
    let texto = `
*╮──⊰ 🎁 هديتك اليومية ⊱──╭*
🏦 ⇦ 💎 الألماس: *${dia}*
🏦 ⇦ 🪙 العملات: *${tok}*
🏦 ⇦ 🎀 النقاط: *${mystic}*
🏦 ⇦ 🥇 الإكسب: *${expp}*
*╯──⊰ ❄️ ⊱──╰*

🎉 مبروك! يمكنك طلب الهدية القادمة بعد 24 ساعة.`

    const fkontak = {
        "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    }

    await conn.sendFile(m.chat, img, 'gift.jpg', texto, fkontak)
}

handler.help = ['هديه', 'راتب']
handler.tags = ['xp']
handler.command = /^(هديه|راتب|هدية|يومي)$/i
handler.level = 0

export default handler

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    return `${hours} ساعة و ${minutes} دقيقة`
}
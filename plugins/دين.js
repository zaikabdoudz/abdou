import fs from 'fs';

let timeout = 60000; // 60 ثانية
let poin = 500;

const handler = async (m, { conn }) => {
    conn.tekateki = conn.tekateki || {};
    let id = m.chat;

    if (conn.tekateki[id]) {
        conn.reply(m.chat, `🦋⃟ᴠͥɪͣᴘͫ•𝆺  
*｢❤️｣⇇ لا يزال هناك سؤال جاري!*`, conn.tekateki[id][0]);
        throw false;
    }

    let filePath = './src/game/dean.json';
    if (!fs.existsSync(filePath)) {
        return conn.reply(m.chat, '❌ للأسف، ملف اللعبة غير موجود أو تم نقله!', m);
    }

    let tekateki;
    try {
        tekateki = JSON.parse(fs.readFileSync(filePath));
    } catch (e) {
        return conn.reply(m.chat, '❌ خطأ في قراءة ملف اللعبة أو صياغة JSON غير صحيحة!', m);
    }

    let json = tekateki[Math.floor(Math.random() * tekateki.length)];
    let clue = json.response.replace(/[A-Za-z]/g, ''); // إزالة الحروف الإنجليزية فقط

    let caption = `
🦋⃟ᴠͥɪͣᴘͫ•𝆺𝅥𓍯
*｢🍄｣⇇ السؤال ↶*
❀ ${json.question} ❀

*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍄❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
*｢🍥｣⇇ الاعـب ↜❪@${m.sender.split('@')[0]}❫*
*｢🍄｣⇇ الوقت ↜❪${(timeout / 1000).toFixed(2)}❫ ثواني*
*｢🍄｣⇇ الجائزة ↜❪ ${poin}❫*
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍄❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
*｢🍷｣⇇ المطور: ιтαcнι вσт*
🦋⃟ᴠͥɪͣᴘͫ•𝆺`.trim();

    // تخزين اللعبة مؤقتًا مع الـ timeout
    conn.tekateki[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(async () => {
            if (conn.tekateki[id]) {
                await conn.reply(m.chat, `
🦋⃟ᴠͥɪͣᴘͫ•𝆺
*｢🍄｣⇇ انتهى الوقت 💔*
*｢🍄｣⇇ الإجابة ↜❪${json.response}❫*
🦋⃟ᴠͥɪͣᴘͫ•𝆺
`.trim(), conn.tekateki[id][0]);
                delete conn.tekateki[id];
            }
        }, timeout)
    ];
};

handler.help = ['دين'];
handler.tags = ['game'];
handler.command = /^(دين)$/i;

export default handler;
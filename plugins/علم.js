import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const timeout = 60000;

let handler = async (m, { conn, command }) => {
    if (command.startsWith('اجاب_')) {
        let id = m.chat;
        let monte = conn.monte[id];

        if (!monte) {
            return conn.reply(m.chat, '*╮───── • ◈ • ─────╭*\n*_لا توجد لعبة نشطة الان 📯📍_*\n*╮───── • ◈ • ─────╭*', m);
        }

        let selectedAnswerIndex = parseInt(command.split('_')[1]);
        if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 1 || selectedAnswerIndex > 4) {
            return conn.reply(m.chat, '*╮───── • ◈ • ─────╭*\n*_اختيار غير صالح يا اخي ❌_*\n*╮───── • ◈ • ─────╭*', m);
        }

        let selectedAnswer = monte.options[selectedAnswerIndex - 1];
        let isCorrect = monte.correctAnswer === selectedAnswer;

        if (isCorrect) {
            await conn.reply(m.chat, `*╮───── • ◈ • ─────╭*\n*_إجابة صحيحة مبروك ❄️✅_*\n*💰┊الجائزة┊⇇≺500xp≺*\n*╮───── • ◈ • ─────╭*`, m);
            global.db.data.users[m.sender].exp += 500;
            clearTimeout(monte.timer);
            delete conn.monte[id];
        } else {
            monte.attempts -= 1;
            if (monte.attempts > 0) {
                await conn.reply(m.chat, `*╮───── • ◈ • ─────╭*\n*_إجابة خاطئة يا اخي 🛠️❌_*\n*_عدد المحاولات التي باقية لك هي ${monte.attempts} 🙂📯_*\n*╯───── • ◈ • ─────╰*`, m);
            } else {
                await conn.reply(m.chat, `*╮───── • ◈ • ─────╭*\n*_إجابة خاطئة 😢_*\n*_انتهت محاولاتك 📯📍_*\n*❄️┊الإجابة الصحيحة┊⇇≺${monte.correctAnswer}≺*\n*╯───── • ◈ • ─────╰*`, m);
                clearTimeout(monte.timer);
                delete conn.monte[id];
            }
        }
    } else {
        try {
            conn.monte = conn.monte || {};
            let id = m.chat;

            if (conn.monte[id]) {
                return conn.reply(m.chat, '*╮───── • ◈ • ─────╭*\n*_لا يمكن لك بدأ لعبة جديد وعلما انك بدأت لعبة ولم تنتهي ❌❄️_*\n*╯───── • ◈ • ─────╰*', m);
            }

            const response = await fetch('https://raw.githubusercontent.com/ze819/game/master/src/game.js/luffy1.json');//هنا رابط الجيت الاسئله
            const monteData = await response.json();

            if (!monteData) {
                throw new Error('*╮───── • ◈ • ─────╭*\n*فشل الحصول على المعلومات كلم اوبيتو*\n*╮───── • ◈ • ─────╭*');
            }

            const monteItem = monteData[Math.floor(Math.random() * monteData.length)];
            const { img, name } = monteItem;

            let options = [name];
            while (options.length < 4) {
                let randomItem = monteData[Math.floor(Math.random() * monteData.length)].name;
                if (!options.includes(randomItem)) {
                    options.push(randomItem);
                }
            }
            options.sort(() => Math.random() - 0.5);

            const media = await prepareWAMessageMedia({ image: { url: img } }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                body: {
                    text: `*╮───── • ◈ • ─────╭*\n*_لعبة تعرف على اسم علم الدولة🌍_*\n\n*⌝ معلومات العبة ┋🪄⌞ ⇊*\n*❄️┊الوقت┊⇇≺60.00 ثانية≺*\n*🐦‍🔥┊الجائزة┊⇇≺500xp≺*\n*╯───── • ◈ • ─────╰*`,
                },
                footer: { text: 'BY : monte' },
                header: {
                    title: 'ㅤ',
                    subtitle: 'المرجو اختيار اسم لاعب من هذه الاختيارات ⇊',
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: options.map((option, index) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: `┊${index + 1}┊⇇≺${option}≺`,
                            id: `.اجاب_${index + 1}`
                        })
                    })),
                },
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: { interactiveMessage },
                },
            }, { userJid: conn.user.jid, quoted: m });

            conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            conn.monte[id] = {
                correctAnswer: name,
                options: options,
                timer: setTimeout(async () => {
                    if (conn.monte[id]) {
                        await conn.reply(m.chat, `*╮───── • ◈ • ─────╭*\n*⌛┊⇇ انتهى الوقت*\n*❄️┊الإجابة الصحيحة┊⇇≺${name}≺*\n*╮───── • ◈ • ─────╭*`, m);
                        delete conn.monte[id];
                    }
                }, timeout),
                attempts: 2
            };

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, 'حدث خطأ في إرسال الرسالة.', m);
        }
    }
};

handler.help = ['اوبيتو'];
handler.tags = ['اوبيتو'];
handler.command = /^(علم|اعلام|اجاب_\d+)$/i;

export default handler;
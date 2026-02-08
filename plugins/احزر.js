import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const timeout = 60000;

let handler = async (m, { conn, command }) => {
    if (command.startsWith('جوابي_')) {
        let id = m.chat;
        let MONTE = conn.MONTE[id];

        if (!MONTE) {
            return conn.reply(m.chat, '*╯───── • ◈ • ─────╰*\n*_لا توجد لعبة نشطة الآن 📯📍_*\n*╯───── • ◈ • ─────╰*', m);
        }

        let selectedAnswerIndex = parseInt(command.split('_')[1]);
        if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 1 || selectedAnswerIndex > 4) {
            return conn.reply(m.chat, '*╯───── • ◈ • ─────╰*\n*_اختيار غير صالح يا أخي ❌_*\n*╯───── • ◈ • ─────╰*', m);
        }

        let selectedAnswer = MONTE.options[selectedAnswerIndex - 1];
        let isCorrect = MONTE.correctAnswer === selectedAnswer;

        if (isCorrect) {
            await conn.reply(m.chat, `*╯───── • ◈ • ─────╰*\n*_إجابة صحيحة مبروك 🐦‍🔥✅_*\n*💰┊الجائزة┊⇇≺500xp≺*\n*╯───── • ◈ • ─────╰*`, m);
            global.db.data.users[m.sender].exp += 500;
            clearTimeout(MONTE.timer);
            delete conn.MONTE[id];
        } else {
            MONTE.attempts -= 1;
            if (MONTE.attempts > 0) {
                await conn.reply(m.chat, `*╯───── • ◈ • ─────╰*\n*_إجابة خاطئة يا أخي 🛠️❌_*\n*_عدد المحاولات الباقية لك هو ${MONTE.attempts} 🙂📯_*\n*╯───── • ◈ • ─────╰*`, m);
            } else {
                await conn.reply(m.chat, `*╯───── • ◈ • ─────╰*\n*_إجابة خاطئة 😢_*\n*_انتهت محاولاتك 📯📍_*\n*🐦‍🔥┊الإجابة الصحيحة┊⇇≺${MONTE.correctAnswer}≺*\n*╯───── • ◈ • ─────╰*`, m);
                clearTimeout(MONTE.timer);
                delete conn.MONTE[id];
            }
        }
    } else {
        try {
            conn.MONTE = conn.MONTE || {};
            let id = m.chat;

            if (conn.MONTE[id]) {
                return conn.reply(m.chat, '*╯───── • ◈ • ─────╰*\n*_لا يمكنك بدء لعبة جديدة لأن هناك لعبة نشطة بالفعل ❌🐦‍🔥_*\n*╯───── • ◈ • ─────╰*', m);
            }

            const response = await fetch('https://gist.githubusercontent.com/Kyutaka101/98d564d49cbf9b539fee19f744de7b26/raw/f2a3e68bbcdd2b06f9dbd5f30d70b9fda42fec14/guessflag');
            const MONTEData = await response.json();

            if (!MONTEData) {
                throw new Error('*╯───── • ◈ • ─────╰*\n*فشل الحصول على المعلومات كلم اوبيتو*\n*╯───── • ◈ • ─────╰*');
            }

            const MONTEItem = MONTEData[Math.floor(Math.random() * MONTEData.length)];
            const { img, name } = MONTEItem;

            let options = [name];
            while (options.length < 4) {
                let randomItem = MONTEData[Math.floor(Math.random() * MONTEData.length)].name;
                if (!options.includes(randomItem)) {
                    options.push(randomItem);
                }
            }
            options.sort(() => Math.random() - 0.5);

            const media = await prepareWAMessageMedia({ image: { url: img } }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                body: {
                    text: `*╯───── • ◈ • ─────╰*\n*_لعبة تعرف على اسم شخصية الأنمي من صورته 🥢_*\n\n*⌝ معلومات اللعبة ┋🪄⌞ ⇊*\n*🐦‍🔥┊الوقت┊⇇≺60 ثانية≺*\n*🐦‍🔥┊الجائزة┊⇇≺500xp≺*\n*╯───── • ◈ • ─────╰*`,
                },
                footer: { text: 'BY : MONTE' },
                header: {
                    title: 'ㅤ',
                    subtitle: 'اختر الإجابة الصحيحة من بين هذه الخيارات ⇊',
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: options.map((option, index) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: `┊${index + 1}┊⇇≺${option}≺`,
                            id: `.جوابي_${index + 1}`
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

            conn.MONTE[id] = {
                correctAnswer: name,
                options: options,
                timer: setTimeout(async () => {
                    if (conn.MONTE[id]) {
                        await conn.reply(m.chat, `*╯───── • ◈ • ─────╰*\n*⌛┊⇇ انتهى الوقت*\n*🐦‍🔥┊الإجابة الصحيحة┊⇇≺${name}≺*\n*╯───── • ◈ • ─────╰*`, m);
                        delete conn.MONTE[id];
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
handler.command = /^(احزر|احزري|جوابي_\d+)$/i;

export default handler;
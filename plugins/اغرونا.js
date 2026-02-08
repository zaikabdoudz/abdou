import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    try {
        const pluginsDir = path.join(process.cwd(), 'plugins'); // مجلد ملفات البلوجن
        const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));

        let commandsList = [];

        for (let file of files) {
            try {
                const modulePath = path.join(pluginsDir, file);
                const plugin = await import(modulePath + '?cache=' + Date.now());
                if (plugin.default?.command) {
                    let cmds = plugin.default.command;
                    if (!Array.isArray(cmds)) cmds = [cmds];
                    commandsList.push({ file, commands: cmds });
                }
            } catch (e) {
                console.error('خطأ في ملف:', file, e.message);
            }
        }

        if (!commandsList.length) return conn.reply(m.chat, 'لم يتم العثور على أوامر.', m);

        let text = '✨ قائمة الأوامر المتوفرة في البوت:\n\n';
        commandsList.forEach((c, i) => {
            text += `${i + 1}. ملف: ${c.file}\n   أوامر: ${c.commands.join(', ')}\n\n`;
        });

        await conn.reply(m.chat, text, m);

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, 'حدث خطأ أثناء جلب الأوامر.', m);
    }
};

handler.command = /^اغرونا$/i;
handler.help = ['اغرونا'];
handler.tags = ['system'];

export default handler;
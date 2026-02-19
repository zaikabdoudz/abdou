const handler = async (m, { conn, isROwner }) => {
  const results = []
  const fixed = []
  const broken = []

  for (const [name, plugin] of Object.entries(global.plugins)) {
    if (!plugin) {
      broken.push(`❌ ${name} — فارغ`)
      continue
    }
    if (typeof plugin !== 'function' && typeof plugin.all !== 'function' && typeof plugin.before !== 'function') {
      broken.push(`⚠️ ${name} — مو function`)
      continue
    }
    results.push(`✅ ${name}`)
  }

  // فحص الملفات في مجلد plugins
  import('fs').then(async ({ readdirSync, readFileSync }) => {
    import('path').then(async ({ join }) => {
      import('url').then(async ({ fileURLToPath }) => {
        import('path').then(({ dirname }) => {
          try {
            const pluginDir = join(process.cwd(), 'plugins')
            const files = readdirSync(pluginDir).filter(f => f.endsWith('.js'))
            const arabicFiles = files.filter(f => /[\u0600-\u06FF]/.test(f))
            const missingImports = []

            for (const file of files) {
              try {
                const content = readFileSync(join(pluginDir, file), 'utf8')
                const usedFns = ['generateWAMessage', 'generateWAMessageFromContent', 'prepareWAMessageMedia', 'proto']
                for (const fn of usedFns) {
                  if (content.includes(fn) && !content.includes(`import`) && !content.includes(fn + ' =')) {
                    missingImports.push(`📦 ${file} — ينقصه import لـ ${fn}`)
                  }
                }
              } catch {}
            }

            let msg = `*🔧 تقرير التصليح*\n\n`
            msg += `*📊 الإحصائيات:*\n`
            msg += `✅ يشتغل: ${results.length}\n`
            msg += `❌ مكسور: ${broken.length}\n\n`

            if (arabicFiles.length > 0) {
              msg += `*⚠️ ملفات بأسماء عربية (لازم تغيرها):*\n`
              arabicFiles.forEach(f => msg += `• ${f}\n`)
              msg += '\n'
            }

            if (broken.length > 0) {
              msg += `*❌ ملفات مكسورة:*\n`
              broken.forEach(b => msg += `${b}\n`)
              msg += '\n'
            }

            if (missingImports.length > 0) {
              msg += `*📦 ينقصها imports:*\n`
              missingImports.forEach(i => msg += `${i}\n`)
              msg += '\n'
            }

            if (arabicFiles.length === 0 && broken.length === 0 && missingImports.length === 0) {
              msg += `*✨ كل شيء تمام!*`
            }

            await m.reply(msg.trim())
          } catch (e) {
            await m.reply(`خطأ: ${e.message}`)
          }
        })
      })
    })
  })
}

handler.command = /^تصليح|fix$/i
handler.rowner = true

export default handler

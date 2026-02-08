import Helper from './helper.js'

const WORKER_DIR = Helper.__dirname(import.meta.url, false)

export async function loadModule(modulePath) {
    const module_ = await import(`${modulePath}?id=${Date.now()}`)
    const result = module_ && 'default' in module_ ? module_.default : module_
    return result
}
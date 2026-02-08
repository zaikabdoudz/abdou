import { dirname } from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import fluent_ffmpeg from "fluent-ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import webp from "node-webpmux";
import fetch from "node-fetch";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure tmp dir exists
const TMP_DIR = path.join(__dirname, "../tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

/**
 * Convert input (buffer or url) to animated/static webp using ffmpeg.
 * Supports GIF by treating it like video.
 */
function sticker6(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                const res = await fetch(url);
                if (res.status !== 200) throw await res.text();
                img = await res.buffer();
            }
            const type = (await fileTypeFromBuffer(img)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };
            if (type.ext === "bin") return reject(new Error("Unknown file type"));

            const tmp = path.join(TMP_DIR, `${+new Date()}.${type.ext}`);
            const out = tmp + ".webp";
            await fs.promises.writeFile(tmp, img);

            // Treat GIF as video (animated)
            const isAnimatedLike = /video|gif/i.test(type.mime) || type.ext === "webm" || type.ext === "mp4";

            const cmd = fluent_ffmpeg(tmp);
            if (isAnimatedLike) {
                // if input format needs to be forced, set it (safe)
                cmd.inputFormat(type.ext).input(tmp);
            } else {
                cmd.input(tmp);
            }

            cmd.on("error", async function (err) {
                console.error("ffmpeg error:", err);
                // cleanup
                try { await fs.promises.unlink(tmp); } catch (e) {}
                try { await fs.promises.unlink(out); } catch (e) {}
                reject(err);
            })
            .on("end", async function () {
                // read output
                try {
                    let resultSticker = await fs.promises.readFile(out);
                    // if larger than 1MB compress with smaller size
                    if (resultSticker.length > 1000000) {
                        try {
                            resultSticker = await sticker6_compress(img, null);
                        } catch (e) {
                            console.warn("compress failed, returning original large sticker:", e);
                        }
                    }
                    // cleanup
                    try { await fs.promises.unlink(tmp); } catch (e) {}
                    try { await fs.promises.unlink(out); } catch (e) {}
                    resolve(resultSticker);
                } catch (e) {
                    try { await fs.promises.unlink(tmp); } catch (err) {}
                    reject(e);
                }
            });

            // Proper filter string (fixed quoting), and animation options
            const filter = "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse";

            cmd.addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", filter,
                "-loop", "0",          // make it animated loop
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .save(out);

        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Smaller variant for compressing big webp.
 */
function sticker6_compress(img, url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                const res = await fetch(url);
                if (res.status !== 200) throw await res.text();
                img = await res.buffer();
            }
            const type = (await fileTypeFromBuffer(img)) || {
                mime: "application/octet-stream",
                ext: "bin",
            };
            if (type.ext === "bin") return reject(new Error("Unknown file type"));

            const tmp = path.join(TMP_DIR, `${+new Date()}.${type.ext}`);
            const out = tmp + ".webp";
            await fs.promises.writeFile(tmp, img);

            const isAnimatedLike = /video|gif/i.test(type.mime) || type.ext === "webm" || type.ext === "mp4";
            const cmd = fluent_ffmpeg(tmp);
            if (isAnimatedLike) {
                cmd.inputFormat(type.ext).input(tmp);
            } else {
                cmd.input(tmp);
            }

            cmd.on("error", async function (err) {
                console.error("ffmpeg compress error:", err);
                try { await fs.promises.unlink(tmp); } catch (e) {}
                try { await fs.promises.unlink(out); } catch (e) {}
                reject(err);
            })
            .on("end", async function () {
                try {
                    const data = await fs.promises.readFile(out);
                    try { await fs.promises.unlink(tmp); } catch (e) {}
                    try { await fs.promises.unlink(out); } catch (e) {}
                    resolve(data);
                } catch (e) {
                    try { await fs.promises.unlink(tmp); } catch (err) {}
                    reject(e);
                }
            });

            const filter = "scale='min(224,iw)':'min(224,ih)':force_original_aspect_ratio=decrease,fps=15,pad=224:224:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse";

            cmd.addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", filter,
                "-loop", "0",
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .save(out);

        } catch (err) {
            reject(err);
        }
    });
}

async function sticker5(
    img,
    url,
    packname,
    author,
    categories = [""],
    extra = {},
  ) {
    const { Sticker } = await import("wa-sticker-formatter");

    // wa-sticker-formatter can accept Buffer or URL; use options for animated if(img is animated)
    const buffer = await new Sticker(img ? img : url)
      .setPack(packname)
      .setAuthor(author)
      .setQuality(10)
      .toBuffer();
    return buffer;
  }

async function addExif(
    webpSticker,
    packname,
    author,
    categories = [""],
    extra = {}
) {
    const img = new webp.Image();
    const stickerPackId = crypto.randomBytes(32).toString("hex");
    const json = {
        "sticker-pack-id": stickerPackId,
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: categories,
        ...extra,
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(webpSticker);
    img.exif = exif;
    return await img.save(null);
}

async function sticker(img, url, ...args) {
    let lastError;
    let stiker;
    for (const func of [
        (global.support && global.support.ffmpeg) ? sticker6 : null,
        sticker5
    ].filter((f) => f)) {
        try {
            console.log(`En sticker.js metodo en ejecucion: ${func.name}`);
            stiker = await func(img, url, ...args);
            // stiker may be Buffer or string
            if (!stiker) continue;
            // if buffer contains HTML error page, skip
            if (Buffer.isBuffer(stiker) && stiker.includes(Buffer.from("<html"))) {
                lastError = new Error("HTML returned instead of image");
                continue;
            }
            // if Buffer contains WEBP header -> add exif and return
            if (Buffer.isBuffer(stiker) && stiker.includes(Buffer.from("WEBP"))) {
                try {
                    return await addExif(stiker, ...args);
                } catch (e) {
                    console.error("addExif failed, returning raw sticker:", e);
                    return stiker;
                }
            }
            // if it's string, throw to trigger next method
            if (typeof stiker === "string") throw new Error(stiker);
            // fallback: return as-is
            return stiker;
        } catch (err) {
            lastError = err;
            continue;
        }
    }
    console.error("all sticker methods failed:", lastError);
    throw lastError;
}

const support = {
    ffmpeg: true,
    ffprobe: true,
    ffmpegWebp: true,
    convert: true,
    magick: false,
    gm: false,
    find: false,
};

export { sticker, sticker6, addExif, support };
/**
 * 补充下载: 歌斐颂巧克力小镇 + 利用云澜湾图片为子页面分配
 * 用法: node download-extra.cjs
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const OUTPUT_BASE = 'D:/大云景点图片';
const MIN_FILE_SIZE = 20 * 1024;

function dedupe(urls) {
  const seen = new Set();
  return urls.filter(u => {
    const key = u.replace(/[?&].*$/, '').replace(/_\w+\d*\.(jpg|png|webp)/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function downloadAll(imageSets) {
  let grandTotal = 0;
  for (const [spotId, urls] of Object.entries(imageSets)) {
    const spotDir = path.join(OUTPUT_BASE, spotId);
    if (!fs.existsSync(spotDir)) fs.mkdirSync(spotDir, { recursive: true });
    const uniqueUrls = dedupe(urls);
    if (uniqueUrls.length === 0) { console.log(`\n📍 ${spotId} — 0 URLs (skip)`); continue; }
    console.log(`\n📍 ${spotId} — ${uniqueUrls.length} URLs`);
    let downloaded = 0;
    for (let i = 0; i < uniqueUrls.length; i++) {
      const url = uniqueUrls[i];
      try {
        let ext = '.jpg';
        if (url.includes('.png')) ext = '.png';
        else if (url.includes('.webp')) ext = '.webp';
        const dest = path.join(spotDir, `img-${String(i + 1).padStart(2, '0')}${ext}`);
        if (fs.existsSync(dest)) { const stat = fs.statSync(dest); if (stat.size >= MIN_FILE_SIZE) { downloaded++; continue; } else fs.unlinkSync(dest); }
        const resp = await axios.get(url, {
          responseType: 'stream',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': url.includes('ctrip') ? 'https://you.ctrip.com/' : 'https://hk.trip.com/' },
          timeout: 30000,
        });
        const writer = fs.createWriteStream(dest);
        await streamPipeline(resp.data, writer);
        const stat = fs.statSync(dest);
        if (stat.size < MIN_FILE_SIZE) { fs.unlinkSync(dest); }
        else { downloaded++; process.stdout.write(`\r  ${downloaded}/${uniqueUrls.length}`); }
      } catch (e) { /* skip */ }
    }
    console.log(`\n  ✅ ${spotId}: ${downloaded} 张`);
    grandTotal += downloaded;
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`\n${'='.repeat(50)}`);
  console.log(`总计下载: ${grandTotal} 张`);
}

const imageSets = {

  // ── 歌斐颂巧克力小镇 (携程 73张用户实拍，2022条点评) ──
  'gopher-chocolate': [
    // 用户"最爱深秋2000" 2024-10-04
    'https://dimg04.c-ctrip.com/images/0EQ5f12000fyotbdj99F9_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5g12000fyp5lb2413D_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6j12000fyof6i1B9FF_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6k12000fynksp14A5F_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6r12000fyoenvnE3FA_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1v12000fynh5weC882_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0w12000fyo6t21D619_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0z12000fyoddrx128C_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1y12000fyovp4eD4AC_W_640_10000.jpg',
    // Chiyatakasugi 2024-10-01
    'https://dimg04.c-ctrip.com/images/0EQ2q12000fvojv4v5A39_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6f12000fvnso7i8ACC_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3r12000fvnlq0h2394_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0b12000fvmurk30E63_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3812000fvoddmy7108_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3u12000fvlqijbC640_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5d12000fvnsmu71344_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ7312000fvoua2gFDBD_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0k12000fvoivf05572_W_640_10000.jpg',
    // YoYo_7F2Z6T9H 2024-07-08
    'https://dimg04.c-ctrip.com/images/0EQ1h12000epz8uut69D9_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3n12000epyxltgFB51_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2x12000epywqz3E53C_W_640_10000.jpg',
    // 会飞的绵绵羊 2024-08-28
    'https://dimg04.c-ctrip.com/images/0EQ0612000f9ywcyv7789_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5612000f9ytmg49167_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2g12000f9z2nf890DE_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5912000f9yp41iB126_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4512000f9yl7x1E9F7_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1i12000f9yt4ms9D6D_W_640_10000.jpg',
    // 匿名用户 2024-10-04
    'https://dimg04.c-ctrip.com/images/0EQ5b12000fyoipgj86C9_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1u12000fyp579f5FF2_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0312000fyo7opl73E8_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2p12000fyp7t8i2368_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1712000fyo0uzxE470_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4d12000fynxir31DE1_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3912000fynvm04DC67_W_640_10000.jpg',
    // YoYo_2Q0R3O8O 2024-07-18
    'https://dimg04.c-ctrip.com/images/0EQ5l12000etoendf5044_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4012000eto6f3j5F81_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6a12000eto9vxf7566_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5n12000etohnhj6FD7_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5h12000etod2ar72D6_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1q12000eto3i3f5672_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5512000eto7xl98A32_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1512000eto1ivl2DF5_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4412000etognaz81BD_W_640_10000.jpg',
    // 匿名用户 2024-06-30
    'https://dimg04.c-ctrip.com/images/0EQ4n12000emt6sjwBE08_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6g12000emt92i45004_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4o12000emt3384CDD4_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5612000emt96q315E0_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4b12000emsyk1x169D_W_640_10000.jpg',
    // YoYo_3F8F2Z2Q 2024-08-25
    'https://dimg04.c-ctrip.com/images/0EQ4q12000f8w04shF8F3_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1b12000f8vt7pu439A_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2q12000f8w5j3s07B0_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5w12000f8w2z610B6C_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5r12000f8vt9xa9733_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4112000f8vtadc1694_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6p12000f8w230k5C32_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0j12000f8vr6glD892_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2712000f8vt7pwFB46_W_640_10000.jpg',
    // 匿名用户 2024-10-04 (3分)
    'https://dimg04.c-ctrip.com/images/0EQ5712000fyi9q3e7B7E_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1z12000fyhwfn22B04_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ7112000fyhpha5370B_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2612000fyhn2fwDEB5_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0r12000fyh2ljn0697_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1512000fyhid0y340D_W_640_10000.jpg',
  ],
};

downloadAll(imageSets).catch(e => { console.error('Error:', e.message); process.exit(1); });

/**
 * 大云旅游度假区 — 13景点图片批量下载
 * 来源: 携程实评 + Trip Moments + 携程游记 + 携程酒店
 * 用法: node download-all.cjs
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const OUTPUT_BASE = 'D:/大云景点图片';
const MIN_FILE_SIZE = 20 * 1024;

// 去重
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
    console.log(`\n📍 ${spotId} — ${uniqueUrls.length} URLs`);
    let downloaded = 0;

    for (let i = 0; i < uniqueUrls.length; i++) {
      const url = uniqueUrls[i];
      try {
        let ext = '.jpg';
        if (url.includes('.png')) ext = '.png';
        else if (url.includes('.webp')) ext = '.webp';

        const dest = path.join(spotDir, `img-${String(i + 1).padStart(2, '0')}${ext}`);
        if (fs.existsSync(dest)) {
          const stat = fs.statSync(dest);
          if (stat.size >= MIN_FILE_SIZE) { downloaded++; continue; }
          else fs.unlinkSync(dest);
        }

        const resp = await axios.get(url, {
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': url.includes('ctrip') ? 'https://you.ctrip.com/' : 'https://hk.trip.com/',
          },
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
  console.log(`路径: ${OUTPUT_BASE}`);
}

// ═══════════════════════════════════════════════════
const imageSets = {

  // ── 01. 大云旅游度假区全景 ──
  '01-dayun-overview': [
    'https://dimg04.c-ctrip.com/images/25t0e12000gkhucin9310_W_2048_1536.png',
    'https://dimg04.c-ctrip.com/images/1mh4q12000cndddxhC329_W_640_10000.jpg',
    'https://ak-d.tripcdn.com/images/1mi0912000sbi2s1m3DC2_W_640_0_R5_Q80.jpg',
  ],

  // ── 02. 曹家村党群服务中心 ──
  '02-caojia-service': [
    'https://dimg04.c-ctrip.com/images/1mh4q12000cndddxhC329_W_640_10000.jpg',
  ],

  // ── 03. 云澜湾温泉国际 (Ctrip 50+张实拍 + Trip Moments) ──
  '03-yunlan-hotspring': [
    // 携程景点页 — 封面
    'https://dimg04.c-ctrip.com/images/25t0e12000gkhucin9310_W_2048_1536.png',
    // 携程景点页 — 用户实拍 (2024-07)
    'https://dimg04.c-ctrip.com/images/0EQ6d12000eudyhq6E72E_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0n12000eudzhqfFD91_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0812000eudz2q2B227_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5q12000euds0frC0F6_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0i12000eudxikw5D47_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1r12000eudwyb88C16_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1m12000eoqlgz1DECE_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2912000eoq7g8vDD66_W_640_10000.jpg',
    // 携程景点页 — 用户实拍 (2024-02, shibond)
    'https://dimg04.c-ctrip.com/images/0EQ2b12000d8k1p986E9C_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0w12000d8k20tj1994_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4j12000d8k11fx8ED3_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6112000d8k25mcE5F2_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1412000d8k1hrgC869_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3p12000d8k2c0d1FCA_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1m12000d8k2q9rA354_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2y12000d8k2k017E21_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5a12000d8k1gl682F2_W_640_10000.jpg',
    // 携程景点页 — 晨光2023
    'https://dimg04.c-ctrip.com/images/0EQ5w12000e470lo3E218_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3o12000e475cv10545_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4r12000e4769xb75FA_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3o12000e475ow790C4_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5m12000dp2nxjt5FC6_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0v12000dp2cx8c60D9_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5z12000dp2sudz9D49_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ3612000dp2xb4h3510_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0h12000dp2xmm84760_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5112000cyq1boe720F_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ4312000cyq19cr06E7_W_640_10000.jpg',
    // 携程景点页 — YoYo 2025
    'https://dimg04.c-ctrip.com/images/1mh5e12000pcn70nz5ADB_W_640_10000.png',
    'https://dimg04.c-ctrip.com/images/1mh4w12000pcn9w9f3138_W_640_10000.png',
    'https://dimg04.c-ctrip.com/images/1mh5412000pcnld5wB65A_W_640_10000.png',
    'https://dimg04.c-ctrip.com/images/1mh1r12000pcnm39m6627_W_640_10000.jpg',
    // 携程景点页 — KYF8888
    'https://dimg04.c-ctrip.com/images/0EQ0g12000ggp2fcwD69B_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6812000ggpo4w064AD_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ0p12000ggpfigx8A34_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ1h12000ggpq6eg8C6B_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6o12000ggpp3yq7751_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5f12000ggpjy4277AB_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ5t12000ggpjti68CF3_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ2e12000ggpsk5z5961_W_640_10000.jpg',
    'https://dimg04.c-ctrip.com/images/0EQ6j12000ggp1ath11C9_W_640_10000.jpg',
    // 携程游记 (嘉善国庆4日游)
    'https://dimg04.c-ctrip.com/images/1mf5n12000g29vw4l130C_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf4r12000g29vaot490E_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf7212000g29ucmhC2E2_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf1e12000g29vn3qE1E6_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf5a12000g29u6q37B3B_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf0512000g29w08nA3E5_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf4o12000g29warw7C3F_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf1812000g29vlml7C14_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf3w12000g29v5wxA725_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf1912000g29vrly0566_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf0r12000g29vhufAF06_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf6p12000g29v1es6DA0_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf0i12000g29vj6zFD86_W_640_0_Q90.jpg',
    'https://dimg04.c-ctrip.com/images/1mf6512000g29ur9tB1F0_W_640_0_Q90.jpg',
    // Trip Moments (Amy7Ashford)
    'https://ak-d.tripcdn.com/images/1mi0912000sbi2s1m3DC2_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi3y12000sbi2wx85009_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi0112000sbi2vs1920B_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi0v12000sbi2p5e9E59_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi1312000sbi2orsFCEF_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi5412000sbi2vcz783B_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi6z12000sbi2ey92508_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi3312000sbi2wxfE61B_W_640_0_R5_Q80.jpg',
    'https://ak-d.tripcdn.com/images/1mi5d12000sbi2vs7BD5E_W_640_0_R5_Q80.jpg',
  ],

  // ── 04. 心意家庭农场 (暂无Ctrip页面，后续手动补充) ──
  '04-xinyi-farm': [],

  // ── 05. 391咖啡 (暂无Ctrip页面) ──
  '05-coffee-391': [],

  // ── 06. 向往的生活咖啡小院 ──
  '06-xiangwang-coffee': [],

  // ── 07. 夕遇小院 ──
  '07-xiyu-yard': [],

  // ── 08. 近云九舍民宿 (Ctrip酒店 80张图片) ──
  '08-jinyun-homestay': [
    'https://dimg04.c-ctrip.com/images/0205d1200082h4uexE9EE_W_1280_853_R5_Q70.jpg',
    'https://dimg04.c-ctrip.com/images/20031b0000019x6pt7032_W_1280_853_R5_Q70.jpg',
    'https://dimg04.c-ctrip.com/images/0AD2r120009fgyr615BD8_W_1280_853_R5_Q70.jpg',
    'https://dimg04.c-ctrip.com/images/0204u1200084o91dm59D6_W_1280_853_R5_Q70.jpg',
    'https://dimg04.c-ctrip.com/images/200j1b0000019uz39CB12_W_1280_853_R5_Q70.jpg',
    'https://dimg04.c-ctrip.com/images/0205d1200082h4wqfCBC3_W_1280_853_R5_Q70.jpg',
    'https://dimg04.c-ctrip.com/images/020181200084u2ijx1C86_W_1280_853_R5_Q70.jpg',
  ],

  // ── 09. 云宝二十四节气馆 ──
  '09-yunbao-museum': [],

  // ── 10. 女人温泉区 ──
  '10-yunlan-women': [],

  // ── 11. 四季花海乐园 ──
  '11-yunlan-flower': [],

  // ── 12. 泓庐SPA精品酒店 ──
  '12-yunlan-hotel': [],

  // ── 13. 樱花风情街 ──
  '13-yunlan-street': [],
};

downloadAll(imageSets).catch(e => { console.error('Error:', e.message); process.exit(1); });

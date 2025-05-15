const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
let CONFIG = {};
try {
    CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
    console.error('Failed to load config.json:', err.message);
    process.exit(1);
}

let successfulPops = 0;
let failedPops = 0;
let totalPopsSent = 0;
let stopped = false;
let page = null;
let loopTimer = null;
let startTime = Date.now();

const STATS_FILE = path.join(__dirname, 'stats.json');

function log(message) {
    const time = new Date().toISOString().replace('T', ' ').split('.')[0];
    console.log(`[${time} UTC] ${message}`);
}

function loadStats() {
    if (!CONFIG.ENABLE_STATS) return {};
    if (fs.existsSync(STATS_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
        } catch (error) {
            log(`Error loading stats file: ${error.message}. Starting with empty stats.`);
            return {};
        }
    }
    return {};
}

function saveStats(country, update = {}) {
    if (!CONFIG.ENABLE_STATS) return;

    const stats = loadStats();

    if (!stats[country]) {
        stats[country] = {
            totalPopsSent: 0,
            successfulPops: 0,
            failedPops: 0,
            firstPopTime: new Date().toISOString(),
            lastPopTime: null
        };
    }

    const c = stats[country];
    c.totalPopsSent += update.totalPopsSent || 0;
    c.successfulPops += update.successfulPops || 0;
    c.failedPops += update.failedPops || 0;
    c.lastPopTime = new Date().toISOString();

    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (error) {
        log(`Error saving stats: ${error.message}`);
    }
}

async function runBot() {
    try {
        startTime = Date.now();

        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        log("🧭 Navigating to [popcat.click]...");
        await page.goto('https://popcat.click/', { waitUntil: 'networkidle2', timeout: 60000 });

        await page.evaluate((country) => {
            document.cookie = `country=${country}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        }, CONFIG.COUNTRY);

        await page.reload({ waitUntil: 'networkidle2' });

        console.clear();

        const bannerWidth = 50;
        const center = (text) => {
            const pad = Math.floor((bannerWidth - text.length) / 2);
            return ' '.repeat(Math.max(0, pad)) + text;
        };
        log('='.repeat(bannerWidth));
        log(center('POPBOT NODE.JS (v1.0.0)'));
        log(center('A simple NodeJS bot to automate pops in popcat.click'));
        log(center('A project by AstrooKai - Made with AI'));
        log('='.repeat(bannerWidth));

        log("🚀 PopBot Started!");
        log(`🌍 Country set to "${CONFIG.COUNTRY}"`);
        log("🌐 Page loaded. Monitoring network...");

        startPopLoop();
    } catch (error) {
        log(`🚨 CRITICAL ERROR in main function: ${error.message}`);
        console.error(error.stack);
        stopped = true;
        await gracefullyStopBot();
        process.exit(1);
    }
}

async function sendPops() {
    if (stopped) return;

    try {
        const responsePromise = page.waitForResponse(
            (res) =>
                res.url().includes('https://stats.popcat.click/pop') &&
                res.status() === 201 &&
                res.request().method() === 'POST',
            { timeout: 10000 } // extend timeout if needed
        );

        for (let i = 0; i < CONFIG.POP_AMOUNT; i++) {
            if (stopped) break;
            await page.click('div.cat-img');
        }

        const response = await responsePromise;

        totalPopsSent += CONFIG.POP_AMOUNT;
        log(`✅ ${CONFIG.POP_AMOUNT} pops successfully sent to ${CONFIG.COUNTRY}! (Total Pops Sent: ${totalPopsSent})`);

        try {
            const body = await response.text();
            log(`[DEBUG]: HTTP 201 Created - ${body}`);
        } catch (parseError) {
            log(`⚠️ Could not parse response body: ${parseError.message}`);
        }

        saveStats(CONFIG.COUNTRY, {
            totalPopsSent: CONFIG.POP_AMOUNT
        });

        if (CONFIG.MAX_POPS !== null && totalPopsSent >= CONFIG.MAX_POPS) {
            log(`🛑 Max successful pops (${CONFIG.MAX_POPS}) reached. Stopping bot...`);
            stopped = true;
            await gracefullyStopBot();
        }

    } catch (error) {
        log(`Error during sendPops: ${error.message}`);
        if (error.message.includes('Timeout') || error.message.includes('Target closed') || error.message.includes('Session closed')) {
            log('Browser or page closed or request failed. Stopping bot.');
            stopped = true;
            await gracefullyStopBot();
        }
    }
}

function startPopLoop() {
    if (stopped) return;

    const sendAndLog = async () => {
        if (stopped) return;
        log(`🐾 Sending ${CONFIG.POP_AMOUNT} pops to [stats.popcat.click]...`);
        log(`⏳ Waiting for ${CONFIG.INTERVAL_MS / 1000} seconds before sending the next pops...`);
        await sendPops();
    };

    sendAndLog();

    loopTimer = setInterval(() => {
        sendAndLog();
    }, CONFIG.INTERVAL_MS);
}

async function gracefullyStopBot() {
    stopped = true;
    if (loopTimer) {
        clearInterval(loopTimer);
        loopTimer = null;
    }

    const elapsedMs = Date.now() - startTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const elapsedMin = Math.floor(elapsedSec / 60);
    const elapsedStr = elapsedMin > 0
        ? `${elapsedMin}m ${elapsedSec % 60}s`
        : `${elapsedSec}s`;

    log("========== 📊 Stats Summary ==========");
    log(`Total Pops Sent:      ${totalPopsSent}`);
    log(`Successful Pops:      ${successfulPops}`);
    log(`Failed Pops:          ${failedPops}`);
    log(`Elapsed Time:         ${elapsedStr}`);
    log("======================================");

    log("Bot is stopping. Cleaning up...");
    if (page) {
        try {
            log("Closing browser...");
            await page.browser().close();
            page = null;
            log("Browser closed.");
        } catch (closeError) {
            log(`Error closing browser: ${closeError.message}`);
        }
    }
    log("PopBot stopped.");
    process.exit(0);
}

process.on('SIGINT', async () => {
    log('SIGINT received. Attempting graceful shutdown...');
    await gracefullyStopBot();
});

process.on('SIGTERM', async () => {
    log('SIGTERM received. Attempting graceful shutdown...');
    await gracefullyStopBot();
});

process.on('uncaughtException', async (error) => {
    log(`UNCAUGHT EXCEPTION: ${error.message}`);
    console.error(error.stack);
    if (!stopped) {
        await gracefullyStopBot();
    } else {
        process.exit(1);
    }
});

process.on('unhandledRejection', async (reason) => {
    log(`UNHANDLED REJECTION: ${reason instanceof Error ? reason.message : reason}`);
    if (reason instanceof Error) console.error(reason.stack);
    if (!stopped) {
        await gracefullyStopBot();
    } else {
        process.exit(1);
    }
});

runBot();

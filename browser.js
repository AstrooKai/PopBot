(() => {
    console.clear();

    const bannerWidth = 60;
    const center = (text) => {
        const pad = Math.floor((bannerWidth - text.length) / 2);
        return ' '.repeat(Math.max(0, pad)) + text;
    };
    console.log('='.repeat(bannerWidth));
    console.log(center('POPBOT BROWSER (v1.0.0)'));
    console.log(center('A simple browser bot to automate pops in popcat.click'));
    console.log(center('A project by AstrooKai - Made with AI'));
    console.log('='.repeat(bannerWidth));

    const CONFIG = {
        POP_AMOUNT: 800,
        INTERVAL_MS: 30000,
        COUNTRY: 'PH',
        MAX_TOTAL_POPS: 100000,
        DEBUG: true
    };

    const now = () => new Date().toLocaleString();

    function log(msg, color = "#0af") {
        console.log(`%c[${now()}] ${msg}`, `color: ${color}`);
    }

    function warn(msg) {
        console.warn(`[${now()}] ${msg}`);
    }

    function error(msg) {
        console.error(`%c[${now()}] ${msg}`, "background: #a00; color: #fff");
    }

    function setCookie(name, value, days = 7) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
        if (CONFIG.DEBUG) log(`Set cookie ${name} to ${value}`, "#999");
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    setCookie('country', CONFIG.COUNTRY);

    function triggerKeyboardShortcut(key = 'g', ctrl = true) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            ctrlKey: ctrl
        });
        document.dispatchEvent(event);
        if (CONFIG.DEBUG) log(`Dispatched keyboard event: Ctrl + ${key}`, "#999");
    }

    triggerKeyboardShortcut();

    let totalPopsSent = 0;

    const intervalId = setInterval(() => {
        const appElement = document.getElementById('app');
        if (!appElement || !appElement.__vue__) {
            if (CONFIG.DEBUG) warn("Vue instance not found. Retrying...");
            return;
        }

        const vue = appElement.__vue__;

        if (vue.bot) {
            error("You've been marked as a bot. Please clear your cookies.");
            clearInterval(intervalId);
            return;
        }

        vue.sequential_max_pops = 0;

        let popsToSend = CONFIG.POP_AMOUNT;
        if (CONFIG.MAX_TOTAL_POPS !== null) {
            const remaining = CONFIG.MAX_TOTAL_POPS - totalPopsSent;
            if (remaining <= 0) {
                log("Reached MAX_TOTAL_POPS. Stopping bot.", "#f80");
                clearInterval(intervalId);
                return;
            } else if (remaining < CONFIG.POP_AMOUNT) {
                popsToSend = remaining;
            }
        }

        if (vue.accumulator === 0) {
            totalPopsSent += popsToSend;
            log(`${popsToSend} pops sent (Total: ${totalPopsSent})`, "#0f0");

            const currentCount = parseInt(getCookie('pop_count') || '0', 10);
            setCookie('pop_count', currentCount + popsToSend);

            vue.open = true;
            setTimeout(() => {
                vue.open = false;
            }, 1000);

            vue.accumulator = popsToSend;
        }

    }, CONFIG.INTERVAL_MS);

    log("Configurable bot started. Waiting for the first response...", "#0f0");
})();
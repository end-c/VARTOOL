// ==UserScript==
// @name         Omni 一键对冲（iframe 强制 + 热键 + 状态浮窗）
// @namespace    omni-hedge
// @version      1.1.0
// @description  Market 模式一键 BUY / SELL 对冲，iframe 强制触发，防止单边成交
// @match        https://omni.variational.io/perpetual/*
// @grant        none
// ==/UserScript==

(() => {
    /********************
     * 配置
     ********************/
    const TRADE_QTY = "0.001";
    const HEDGE_DELAY = 300;
    const MAX_RETRY = 12;
    const HOTKEY = e => e.ctrlKey && e.altKey && e.key.toLowerCase() === "v";

    let RUNNING = false;

    /********************
     * 状态浮窗
     ********************/
    const panel = document.createElement("div");
    panel.style = `
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 999999;
        background: rgba(15,23,42,0.95);
        color: #e5e7eb;
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 12px;
        font-family: monospace;
        min-width: 260px;
        display: none;
        box-shadow: 0 10px 30px rgba(0,0,0,.4);
    `;
    document.body.appendChild(panel);

    const show = () => panel.style.display = "block";
    const hide = () => panel.style.display = "none";
    const clear = () => panel.innerHTML = "";

    const log = msg => {
        const line = document.createElement("div");
        line.textContent = msg;
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    };

    const ok = msg => log(`✔ ${msg}`);
    const warn = msg => log(`⚠ ${msg}`);
    const err = msg => log(`✖ ${msg}`);

    /********************
     * 工具
     ********************/
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const visible = el => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    };

    const click = el => {
        el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };

    const waitSubmit = async (side) => {
        for (let i = 0; i < MAX_RETRY; i++) {
            const b = document.querySelector('button[data-testid="submit-button"]');
            if (
                b &&
                visible(b) &&
                !b.disabled &&
                b.innerText.includes(side)
            ) return b;
            await sleep(200);
        }
        return null;
    };

    const findSideBtn = side =>
        [...document.querySelectorAll("button")]
            .find(b => visible(b) && b.innerText.trim().startsWith(side));

    /********************
     * 核心逻辑
     ********************/
    async function hedge() {
        if (RUNNING) {
            warn("已有对冲在执行，忽略触发");
            return;
        }
        RUNNING = true;

        clear();
        show();
        ok("启动一键对冲");

        try {
            /* Market & 非 Pro */
            const marketBtn = document.querySelector('[data-testid="toggle-select"] button.border-azure');
            if (!marketBtn || marketBtn.innerText !== "Market") throw "不是 Market 模式";

            const pro = document.querySelector('[data-testid="dropdown-menu"]')?.innerText.includes("Pro");
            if (pro) throw "当前为 Pro 模式";
            ok("Market / 非 Pro 校验通过");

            /* 杠杆 ≤ 10X */
            const levBtn = document.querySelector('[data-testid="leverage-button"]');
            const lev = Number(levBtn?.innerText.match(/\d+/)?.[0]);
            if (!lev || lev > 10) throw `杠杆异常：${levBtn?.innerText}`;
            ok(`杠杆 ${lev}X`);

            /* 数量 */
            const qty = document.querySelector('input[data-testid="quantity-input"]');
            qty.focus();
            qty.value = "";
            qty.dispatchEvent(new Event("input", { bubbles: true }));
            qty.value = TRADE_QTY;
            qty.dispatchEvent(new Event("input", { bubbles: true }));
            ok(`数量 ${TRADE_QTY}`);

            /* 判断方向 */
            const submit = await waitSubmit("Buy") || await waitSubmit("Sell");
            if (!submit) throw "找不到提交按钮";

            const first = submit.innerText.includes("Buy") ? "Buy" : "Sell";
            const second = first === "Buy" ? "Sell" : "Buy";
            ok(`首单方向 ${first}`);

            /* 首单 */
            click(submit);
            ok(`${first} 已提交`);

            /* 切换方向 */
            await sleep(120);
            const switchBtn = findSideBtn(second);
            if (!switchBtn) throw "找不到方向切换按钮";
            click(switchBtn);
            ok(`切换到 ${second}`);

            /* 对冲 */
            warn("进入强制对冲保护");
            await sleep(HEDGE_DELAY);

            const hedgeBtn = await waitSubmit(second);
            if (!hedgeBtn) throw "反向按钮不可用（防止单边成交）";

            click(hedgeBtn);
            ok(`对冲完成：${first} → ${second}`);

        } catch (e) {
            err(String(e));
        } finally {
            RUNNING = false;
        }
    }

    /********************
     * iframe 强制注入
     ********************/
    function injectHotkey(win) {
        win.addEventListener("keydown", e => {
            if (HOTKEY(e)) {
                e.preventDefault();
                hedge();
            }
            if (e.key === "Escape") hide();
        });
    }

    injectHotkey(window);

    setInterval(() => {
        document.querySelectorAll("iframe").forEach(f => {
            try {
                injectHotkey(f.contentWindow);
            } catch { }
        });
    }, 1000);

})();

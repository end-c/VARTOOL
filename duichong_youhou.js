// ==UserScript==
// @name         Omni 一键对冲（热键 + 状态浮窗）
// @namespace    omni-hedge
// @version      1.0.0
// @description  Market 模式一键 BUY / SELL 对冲，带失败保护
// @match        https://omni.variational.io/perpetual/*
// @grant        none
// ==/UserScript==

(() => {
    /********************
     * 配置
     ********************/
    const TRADE_QTY = "0.001";
    const HEDGE_DELAY = 300;
    const MAX_RETRY = 10;

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
        min-width: 240px;
        display: none;
        box-shadow: 0 10px 30px rgba(0,0,0,.4);
    `;
    document.body.appendChild(panel);

    const show = () => panel.style.display = "block";
    const hide = () => panel.style.display = "none";

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

    const click = el => {
        el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };

    const visible = el => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    };

    const findSideBtn = side =>
        [...document.querySelectorAll("button")]
            .find(b => visible(b) && b.innerText.trim().startsWith(side));

    /********************
     * 核心逻辑
     ********************/
    async function hedge() {
        panel.innerHTML = "";
        show();
        ok("启动一键对冲");

        /* Market & 非 Pro */
        const marketBtn = document.querySelector('[data-testid="toggle-select"] button.border-azure');
        if (!marketBtn || marketBtn.innerText !== "Market") {
            err("不是 Market 模式");
            return;
        }

        const pro = document.querySelector('[data-testid="dropdown-menu"]')?.innerText.includes("Pro");
        if (pro) {
            err("当前为 Pro 模式");
            return;
        }
        ok("Market / 非 Pro 校验通过");

        /* 杠杆 ≤ 10X */
        const levBtn = document.querySelector('[data-testid="leverage-button"]');
        const lev = Number(levBtn?.innerText.match(/\d+/)?.[0]);
        if (!levBtn || !lev || lev > 10) {
            err(`杠杆异常：${levBtn?.innerText}`);
            return;
        }
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
        const submit = document.querySelector('button[data-testid="submit-button"]');
        const isBuy = submit.innerText.includes("Buy");
        const first = isBuy ? "Buy" : "Sell";
        const second = isBuy ? "Sell" : "Buy";
        ok(`首单方向 ${first}`);

        /* 首单 */
        click(submit);
        ok(`${first} 已提交`);

        /* 切换方向 */
        await sleep(100);
        const switchBtn = findSideBtn(second);
        if (!switchBtn) {
            err("找不到方向切换按钮");
            return;
        }
        click(switchBtn);
        ok(`切换到 ${second}`);

        /* 强制对冲 */
        warn("进入强制对冲保护");

        await sleep(HEDGE_DELAY);
        let success = false;

        for (let i = 1; i <= MAX_RETRY; i++) {
            const btn = document.querySelector('button[data-testid="submit-button"]');
            if (btn && btn.innerText.includes(second)) {
                click(btn);
                ok(`对冲尝试 ${i}`);
                success = true;
                break;
            }
            await sleep(200);
        }

        if (!success) {
            err("⚠ 反向单未能派发（风险）");
        } else {
            ok(`对冲完成：${first} → ${second}`);
        }
    }

    /********************
     * 热键监听
     ********************/
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "v") {
            e.preventDefault();
            hedge();
        }
        if (e.key === "Escape") {
            hide();
        }
    });

})();

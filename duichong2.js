(async () => {

    // 可配置参数
    const TRADE_QTY = "0.001";   // 交易数量
    const HEDGE_DELAY = 300;    // 对冲间隔(ms)
    const WAIT_TIMEOUT = 2000;  // UI 等待超时(ms)


    // Console 日志样式
    const log = {
        ok: msg => console.log(`%c✔ ${msg}`, "color:#22c55e;font-weight:bold"),
        info: msg => console.log(`%cℹ ${msg}`, "color:#38bdf8"),
        warn: msg => console.warn(`⚠ ${msg}`),
        err: msg => {
            console.error(`%c✖ ${msg}`, "color:#ef4444;font-weight:bold");
            throw new Error(msg);
        }
    };

    /********************
     * 工具函数
     ********************/
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const isVisible = el => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden";
    };

    const click = el => {
        if (!el || el.disabled) log.err("按钮不可点击");
        el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };

    const waitFor = async (fn, desc) => {
        const start = Date.now();
        while (Date.now() - start < WAIT_TIMEOUT) {
            const res = fn();
            if (res) return res;
            await sleep(50);
        }
        log.err(`等待超时：${desc}`);
    };

    const findSideButton = side =>
        [...document.querySelectorAll("button")]
            .find(b => isVisible(b) && !b.disabled && b.innerText.trim().startsWith(side));

    // 校验 Market 
    const marketBtn = document.querySelector('[data-testid="toggle-select"] button.border-azure');
    if (!marketBtn || marketBtn.innerText.trim() !== "Market") {
        log.err("当前不是 Market 模式");
    }
    log.ok("Market校验通过");

    // 校验杠杆 ≤ 10X
    const leverageBtn = document.querySelector('[data-testid="leverage-button"]');
    if (!leverageBtn) log.err("找不到杠杆按钮");

    const m = leverageBtn.innerText.match(/(\d+(\.\d+)?)/);
    if (!m) log.err("无法解析杠杆值");

    const leverage = Number(m[1]);
    if (leverage > 10) {
        log.err(`当前杠杆 ${leverage}X > 10X，终止执行`);
    }

    log.ok(`当前杠杆 ${leverage}X`);

    // 输入数量
    const qtyInput = await waitFor(
        () => document.querySelector('input[data-testid="quantity-input"]'),
        "数量输入框"
    );

    qtyInput.focus();
    qtyInput.value = "";
    qtyInput.dispatchEvent(new Event("input", { bubbles: true }));

    qtyInput.value = TRADE_QTY;
    qtyInput.dispatchEvent(new Event("input", { bubbles: true }));

    log.ok(`数量已输入：${TRADE_QTY}`);

    // 判定当前方向
    const submitBtn = await waitFor(
        () => document.querySelector('button[data-testid="submit-button"]'),
        "提交按钮"
    );

    const isBuy = submitBtn.innerText.includes("Buy");
    const first = isBuy ? "Buy" : "Sell";
    const second = isBuy ? "Sell" : "Buy";

    log.info(`当前方向：${first}`);

    // 首单（失败则终止）
    if (submitBtn.disabled) log.err("首单按钮为 disabled");

    click(submitBtn);
    log.ok(`${first} 已提交`);

    // 切换方向
    const switchBtn = await waitFor(
        () => findSideButton(second),
        `切换到 ${second}`
    );

    click(switchBtn);
    log.ok(`已切换方向 → ${second}`);

    // 等待 submit-button 更新
    const hedgeBtn = await waitFor(
        () => {
            const b = document.querySelector('button[data-testid="submit-button"]');
            return b && b.innerText.includes(second) && !b.disabled ? b : null;
        },
        `等待 ${second} 按钮就绪`
    );

    // 确认数量（防 UI 重置）
    const qtyInput2 = document.querySelector('input[data-testid="quantity-input"]');
    if (Number(qtyInput2.value) !== Number(TRADE_QTY)) {
        qtyInput2.value = TRADE_QTY;
        qtyInput2.dispatchEvent(new Event("input", { bubbles: true }));
        log.warn("数量被重置，已重新填充");
    }

    // 对冲（最终执行）
    await sleep(HEDGE_DELAY);
    click(hedgeBtn);

    log.ok(`对冲完成：${first} → ${second}`);
    log.ok("一键对冲执行成功");

})();

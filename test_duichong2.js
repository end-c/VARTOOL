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

    /********************
     * 1. 校验输入框及状态
     ********************/
    const qtyInput = await waitFor(
        () => document.querySelector('input[data-testid="quantity-input"]'),
        "数量输入框"
    );

    if (!qtyInput) {
        log.err("找不到数量输入框");
        return;
    }

    // 输出输入框状态
    console.log("输入框属性：", qtyInput);
    console.log("输入框是否被禁用：", qtyInput.disabled);
    console.log("输入框是否只读：", qtyInput.readOnly);

    // 强制移除禁用状态（如果有）
    qtyInput.disabled = false;
    qtyInput.readOnly = false;

    // 强制修改输入框的值
    qtyInput.focus();
    qtyInput.value = TRADE_QTY;

    // 强制触发 input 和 change 事件，模拟用户操作
    qtyInput.dispatchEvent(new Event("input", { bubbles: true }));
    qtyInput.dispatchEvent(new Event("change", { bubbles: true }));

    log.ok(`数量已输入：${TRADE_QTY}`);

    // 校验 Market 模式
    const marketBtn = document.querySelector('[data-testid="toggle-select"] button.border-azure');
    if (!marketBtn || marketBtn.innerText.trim() !== "Market") {
        log.err("当前不是 Market 模式");
        return;
    }
    log.ok("Market校验通过");

    /********************
     * 校验杠杆 ≤ 10X
     ********************/
    const leverageBtn = document.querySelector('[data-testid="leverage-button"]');
    if (!leverageBtn) log.err("找不到杠杆按钮");

    const m = leverageBtn.innerText.match(/(\d+(\.\d+)?)/);
    if (!m) log.err("无法解析杠杆值");

    const leverage = Number(m[1]);
    if (leverage > 10) {
        log.err(`当前杠杆 ${leverage}X > 10X，终止执行`);
        return;
    }

    log.ok(`当前杠杆 ${leverage}X`);

    /********************
     * 2. 执行首单
     ********************/
    const submitBtn = await waitFor(
        () => document.querySelector('button[data-testid="submit-button"]'),
        "提交按钮"
    );

    const isBuy = submitBtn.innerText.includes("Buy");
    const first = isBuy ? "Buy" : "Sell";
    const second = isBuy ? "Sell" : "Buy";

    log.info(`当前方向：${first}`);

    click(submitBtn);
    log.ok(`${first} 已提交`);

    /********************
     * 3. 切换方向并执行对冲
     ********************/
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
            if (!b) return null;
            if (!b.innerText.includes(second)) return null;
            return b; // ❗ 不再检查 disabled
        },
        `等待 ${second} submit-button 出现`
    );

    // 确认数量（防 UI 重置）
    const qtyInput2 = document.querySelector('input[data-testid="quantity-input"]');
    if (Number(qtyInput2.value) !== Number(TRADE_QTY)) {
        qtyInput2.value = TRADE_QTY;
        qtyInput2.dispatchEvent(new Event("input", { bubbles: true }));
        log.warn("数量被重置，已重新填充");
    }

    // 对冲（最终执行）
    log.warn("进入强制对冲模式（首单已提交）");

    const MAX_RETRY = 10;
    let clicked = false;

    for (let i = 1; i <= MAX_RETRY; i++) {
        const btn = document.querySelector('button[data-testid="submit-button"]');

        if (btn && btn.innerText.includes(second)) {
            try {
                // 即使 disabled 也强制派发事件
                btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
                btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
                btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

                log.ok(`第 ${i} 次尝试：${second} click 已派发`);
                clicked = true;
                break;
            } catch (e) {
                log.warn(`第 ${i} 次 click 失败`);
            }
        }

        await sleep(200);
    }

    if (!clicked) {
        log.err("⚠️ 严重风险：反向单未能派发 click（可能只成交一边）");
    } else {
        log.ok(`🔁 对冲 click 已执行：${second}`);
    }

    log.ok(`${second} 已提交`);
    log.ok(`对冲完成：${first} → ${second}`);
    log.ok("一键对冲执行成功");


})();

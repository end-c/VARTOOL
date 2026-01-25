(() => {
    /********************
     * 可配置参数
     ********************/
    const TRADE_QTY = "0.001";   // <<< 修改你的交易数量
    const HEDGE_DELAY = 300;    // BUY / SELL 间隔(ms)

    /********************
     * 工具函数
     ********************/
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const click = el => {
        if (!el) throw new Error("❌ 找不到元素，无法点击");
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };


    function findSideButton(side) {
        side = side.toLowerCase(); // buy / sell

        return [...document.querySelectorAll("button")]
            .find(btn =>
                btn.textContent.trim().startsWith(side[0].toUpperCase() + side.slice(1)) &&
                !btn.disabled &&
                isVisible(btn)
            );
    }

    function currentSide() {
        const disabled = [...document.querySelectorAll("button")]
            .find(btn =>
                (btn.textContent.trim().startsWith("Buy") ||
                    btn.textContent.trim().startsWith("Sell")) &&
                btn.disabled &&
                isVisible(btn)
            );
        return disabled ? disabled.textContent.trim().startsWith("Buy") ? "BUY" : "SELL" : "UNKNOWN";
    }

    /********************
     * 1️⃣ 校验 Market + 非 Pro
     ********************/
    const marketBtn = document.querySelector(
        '[data-testid="toggle-select"] button.border-azure'
    );
    if (!marketBtn || marketBtn.innerText.trim() !== "Market") {
        throw new Error("❌ 当前不是 Market 模式，终止执行");
    }

    const proLabel = document.querySelector('[data-testid="dropdown-menu"] span');
    if (proLabel && proLabel.innerText.includes("Pro")) {
        throw new Error("❌ 当前为 Pro 模式，终止执行");
    }

    console.log("✅ Market 模式 & 非 Pro，校验通过");

    /********************
     * 2️⃣ 校验杠杆存在（不修改）
     ********************/
    const leverageBtn = document.querySelector('[data-testid="leverage-button"]');
    if (!leverageBtn) {
        throw new Error("❌ 找不到杠杆按钮");
    }
    console.log("✅ 当前杠杆:", leverageBtn.innerText);

    /********************
     * 3️⃣ 输入数量
     ********************/
    const qtyInput = document.querySelector(
        'input[data-testid="quantity-input"]'
    );
    if (!qtyInput) {
        throw new Error("❌ 找不到数量输入框");
    }

    qtyInput.focus();
    qtyInput.value = "";
    qtyInput.dispatchEvent(new Event("input", { bubbles: true }));

    qtyInput.value = TRADE_QTY;
    qtyInput.dispatchEvent(new Event("input", { bubbles: true }));

    console.log("✅ 已输入数量:", TRADE_QTY);

    /********************
     * 4️⃣ 判断 BUY / SELL
     ********************/
    const submitBtn = document.querySelector(
        'button[data-testid="submit-button"]'
    );
    if (!submitBtn) {
        throw new Error("❌ 找不到提交按钮");
    }

    const isBuy = submitBtn.innerText.includes("Buy");
    const firstAction = isBuy ? "BUY" : "SELL";
    const secondAction = isBuy ? "SELL" : "BUY";

    console.log(`🚀 当前方向: ${firstAction}`);

    /********************
     * 5️⃣ 第一次下单
     ********************/
    click(submitBtn);
    console.log(`✅ ${firstAction} 已点击`);

    /********************
     * 6️⃣ 对冲（反向）
     ********************/

    //   这里应该先切换方向BUY ↔ SELL互换，确认数量，反向对冲
    const switchtoBtn = findSideButton(secondAction)
    click(switchtoBtn)

    /********************
 * 3️⃣ 输入数量
 ********************/
    const qtyInput2 = document.querySelector(
        'input[data-testid="quantity-input"]'
    );
    if (!qtyInput2) {
        throw new Error("❌ 找不到数量输入框");
    }

    // 只比较数值
    if (qtyInput2.value !== TRADE_QTY) {
        qtyInput2.focus();
        qtyInput2.value = "";
        qtyInput2.dispatchEvent(new Event("input", { bubbles: true }));

        qtyInput2.value = TRADE_QTY;
        qtyInput2.dispatchEvent(new Event("input", { bubbles: true }));

        console.log("✅ 已输入数量:", TRADE_QTY);
    }

    // 这会儿才对冲
    setTimeout(() => {
        const hedgeBtn = document.querySelector(
            'button[data-testid="submit-button"]'
        );

        if (!hedgeBtn || !hedgeBtn.innerText.includes(secondAction)) {
            console.warn("⚠️ 对冲按钮未就绪，可能方向未切换");
            return;
        }

        click(hedgeBtn);
        console.log(`🔁 对冲完成：${secondAction}`);
    }, HEDGE_DELAY);
})();
(async () => {
    console.log("[AUTO] side switch start");

    /* ========= 工具 ========= */
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    function isVisible(el) {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    function humanClick(el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }

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

    /* ========= 主流程 ========= */

    try {
        await sleep(1500);

        console.log("[AUTO] current side:", currentSide());

        // 你可以改成 "buy" 或 "sell"
        const TARGET_SIDE = "sell";

        const targetBtn = findSideButton(TARGET_SIDE);

        if (!targetBtn) {
            console.log(`[AUTO] already in ${TARGET_SIDE.toUpperCase()} mode`);
            return;
        }

        console.log("[AUTO] switching to", TARGET_SIDE.toUpperCase());
        humanClick(targetBtn);

        await sleep(800);
        console.log("[AUTO] switched, now:", currentSide());

    } catch (err) {
        console.error("[AUTO] failed:", err);
    }
})();



(async () => {
    console.log("[AUTO] input quantity start");

    /* ========= 工具 ========= */
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    function isVisible(el) {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    function setReactInputValue(input, value) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        ).set;

        nativeSetter.call(input, value);

        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    async function waitForQuantityInput(timeout = 15000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const input = document.querySelector(
                'input[data-testid="quantity-input"]'
            );
            if (input && isVisible(input) && !input.disabled) {
                return input;
            }
            await sleep(300);
        }
        throw new Error("quantity input not found");
    }

    /* ========= 主流程 ========= */

    try {
        await sleep(1000);

        const qtyInput = await waitForQuantityInput();
        console.log("[AUTO] quantity input found");

        qtyInput.focus();
        await sleep(200);

        // 👇👇👇 在这里改数量
        const QTY = "0.01";

        setReactInputValue(qtyInput, QTY);

        await sleep(200);
        qtyInput.blur();

        console.log("[AUTO] quantity set:", QTY);

    } catch (err) {
        console.error("[AUTO] failed:", err);
    }
})();


(async () => {
    console.log("[AUTO] submit click start");

    /* ========= 工具 ========= */
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    function isVisible(el) {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    function humanClick(el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }

    function currentSide() {
        const btn = [...document.querySelectorAll("button")]
            .find(b =>
                (b.textContent.trim().startsWith("Buy") ||
                    b.textContent.trim().startsWith("Sell")) &&
                b.disabled
            );

        if (!btn) return "UNKNOWN";
        return btn.textContent.trim().startsWith("Buy") ? "BUY" : "SELL";
    }

    async function waitForSubmitButton(timeout = 15000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const btn = document.querySelector(
                'button[data-testid="submit-button"]'
            );
            if (btn && isVisible(btn) && !btn.disabled) {
                return btn;
            }
            await sleep(300);
        }
        throw new Error("submit button not ready");
    }

    /* ========= 主流程 ========= */
    try {
        await sleep(500);

        const side = currentSide();
        console.log("[AUTO] current side:", side);

        if (side === "UNKNOWN") {
            throw new Error("cannot detect side");
        }

        const submitBtn = await waitForSubmitButton();

        const text = submitBtn.textContent.trim();
        console.log("[AUTO] submit text:", text);

        if (
            (side === "BUY" && !text.startsWith("Buy")) ||
            (side === "SELL" && !text.startsWith("Sell"))
        ) {
            throw new Error("submit button text mismatch with side");
        }

        await sleep(500);
        humanClick(submitBtn);

        console.log(`[AUTO] ${text} clicked`);

    } catch (err) {
        console.error("[AUTO] failed:", err);
    }
})();

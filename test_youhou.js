(function () {
    'use strict';

    console.log("🔥 Hedge script loaded");

    function hedge() {
        console.log("🚀 Hedge triggered");
        alert("HEDGE TRIGGERED"); // 测试用
    }

    function hide() {
        console.log("❌ Hide panel");
    }

    window.addEventListener(
        "keydown",
        e => {
            if (e.altKey && e.key.toLowerCase() === "v") {
                e.preventDefault();
                e.stopPropagation();
                hedge();
            }
            if (e.key === "Escape") {
                hide();
            }
        },
        true
    );
})();

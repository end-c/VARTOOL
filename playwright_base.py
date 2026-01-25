# from playwright.sync_api import sync_playwright

# url = "https://omni.variational.io/perpetual/BTC"

# with sync_playwright() as p:
#     # 1. 启动浏览器（建议先用 headed=True，方便你观察）
#     browser = p.chromium.launch(
#         headless=False,   # 调试阶段建议 False
#         slow_mo=50        # 每个操作放慢一点，方便看
#     )

#     # 2. 新建上下文（模拟一个干净的浏览器环境）
#     context = browser.new_context()

#     # 3. 新建页面
#     page = context.new_page()

#     # 4. 打开网页
#     page.goto(url, wait_until="networkidle")

#     # ⚠️ 动态网页关键点：
#     # networkidle = 网络基本空闲，但有些前端仍可能延迟渲染
#     page.wait_for_timeout(3000)  # 再等 3 秒，确保 DOM 完整

#     # 5. 获取渲染后的 HTML
#     html = page.content()

#     # 6. 保存为本地文件
#     with open("btc_page.html", "w", encoding="utf-8") as f:
#         f.write(html)

#     print("HTML 已保存为 btc_page.html")

#     # 7. 关闭浏览器
#     browser.close()

from playwright.sync_api import sync_playwright

url = "https://omni.variational.io/perpetual/BTC"

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir="pw_profile_test",  # 随便一个新目录
        headless=False,
        slow_mo=50,
    )

    page = context.new_page()
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_timeout(5000)

    page.pause()  # 👈 关键：停住观察

    context.close()



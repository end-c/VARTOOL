from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
USER_DATA_DIR = r"C:\ChromeProfiles\test_real_profile"  # 可以是一个你平时用的，也可以复制一份

url = "https://omni.variational.io/perpetual/BTC"

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        user_data_dir=USER_DATA_DIR,
        executable_path=CHROME_PATH,   # 🔥 关键点
        headless=False,
        slow_mo=50,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-first-run",
            "--no-default-browser-check",
        ],
    )

    page = context.new_page()
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_timeout(5000)

    page.pause()  # 👈 停下来观察

    context.close()
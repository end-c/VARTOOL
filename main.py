from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

# 1. 启动浏览器
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install())
)

try:
    # 2. 打开网页
    url = "https://omni.variational.io/perpetual/BTC"
    driver.get(url)

    # WebDriverWait(driver, 20).until(
    #     EC.presence_of_element_located((
    #         By.XPATH, "//span[text()='Buy' or text()='Sell' or text()='Market']"
    #     ))
    # )
    time.sleep(300) 
    html = driver.page_source

    with open("omni_btc_rendered.html", "w", encoding="utf-8") as f:
        f.write(html)

    print("[OK] Rendered HTML saved")


    # # 5. 找到 className = "xx" 的 button
    # button = WebDriverWait(driver, 10).until(
    #     EC.element_to_be_clickable((By.CLASS_NAME, "xx"))
    # )

    # # 6. 点击
    # button.click()

    time.sleep(3)  # 看下点击效果

finally:
    driver.quit()



# <span class="group text-xs flex flex-1 gap-0.5" role="switch" aria-checked="false">
#     <button disabled="" class="flex flex-1 items-center justify-center rounded-md flex-col group-disabled:pointer-events-none px-2 py-0.5 bg-transparent border border-green text-green fill-green">
#         <span class="flex items-center gap-1">Buy</span>
 
#             <span slot="false-subtitle" data-testid="ask-price-display" class="text-current min-h-4">$89,942.83</span></button> 
#     <button class="flex flex-1 items-center justify-center rounded-md flex-col group-disabled:pointer-events-none px-2 py-0.5 text-blackwhite/80 fill-blackwhite/80 border border-transparent enabled:hover:text-red enabled:hover:fill-red">
#         <span class="flex items-center gap-1">Sell<svg width="16" height="8" class="hidden lg:block" viewBox="0 0 16 8" xmlns="http://www.w3.org/2000/svg"><path d="M1.30473 0.195262C1.04438 -0.0650874 0.622268 -0.0650874 0.361919 0.195262C0.101569 0.455612 0.101569 0.877722 0.361919 1.13807L3.6227 4.39886C3.74166 4.51785 3.85752 4.63373 3.96366 4.72384C4.08023 4.8228 4.22816 4.92918 4.4213 4.99193C4.68909 5.07894 4.97755 5.07894 5.24535 4.99193C5.43849 4.92918 5.58642 4.8228 5.70298 4.72384C5.80913 4.63373 5.92498 4.51785 6.04394 4.39887L7.88381 2.55899C8.0236 2.4192 8.10045 2.34308 8.1599 2.29261L8.16666 2.28694L8.17341 2.29261C8.23286 2.34308 8.30971 2.4192 8.4495 2.55898L12.5572 6.66667H9.49999C9.1318 6.66667 8.83332 6.96514 8.83332 7.33333C8.83332 7.70152 9.1318 8 9.49999 8H14.1667C14.5348 8 14.8333 7.70152 14.8333 7.33333V2.66667C14.8333 2.29848 14.5348 2 14.1667 2C13.7985 2 13.5 2.29848 13.5 2.66667V5.72386L9.37727 1.60114C9.25832 1.48215 9.14246 1.36627 9.03631 1.27616C8.91975 1.1772 8.77182 1.07082 8.57868 1.00807C8.31089 0.921056 8.02242 0.921056 7.75463 1.00807C7.56149 1.07082 7.41356 1.1772 7.297 1.27616C7.19086 1.36626 7.07502 1.48213 6.95607 1.60111L5.11616 3.44102C4.97638 3.5808 4.89953 3.65692 4.84008 3.70739L4.83332 3.71306L4.82657 3.70739C4.76712 3.65692 4.69026 3.5808 4.55048 3.44102L1.30473 0.195262Z" fill="currentColor"></path></svg></span> <span slot="true-subtitle" data-testid="bid-price-display" class="text-current min-h-4">$89,939.12</span></button></span>
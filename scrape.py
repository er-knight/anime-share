import lzma
import sys

from datetime import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options


options = Options()

# https://developer.chrome.com/docs/chromium/new-headless
options.add_argument('--headless=new')

driver = webdriver.Chrome(options=options)

with open(f"{datetime.now().strftime('%Y%m%d')}.txt", 'r') as logs:
    try:
        last_line = logs.readlines()[-1]
    except Exception as e:
        print('[last_line]', e)
        last_line = None

with open(f"{datetime.now().strftime('%Y%m%d')}.txt", 'a') as logs:

    limit = int(last_line.split()[2]) if last_line else 19550

    try:
        driver.get(f'https://myanimelist.net/topanime.php?limit={limit}')

        for page in range(limit, 26000, 50):
            with lzma.open(f'./compressed-files/index-{page:}-{page + 50}.xz', 'w') as f:
                page_source_bytes = driver.page_source.encode() 
                f.write(page_source_bytes)
                logs.write(f"[{datetime.now()}] {page}  Written {len(page_source_bytes)} bytes to 'index-{page:}-{page + 50}.xz'\n")

            try:
                next_button = driver.find_element(by=By.CLASS_NAME, value='link-blue-box.next')
                next_button.click()

                driver.implicitly_wait(1)
            except Exception as e:
                print('[next_button]', e)
                sys.exit(0)

    except Exception as e:
        print('[driver.get]', e)

driver.close()

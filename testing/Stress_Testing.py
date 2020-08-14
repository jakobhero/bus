from selenium import webdriver
from selenium.webdriver.chrome.options import Options

for i in range(0,500):
    chrome_options = Options()
    #chrome_options.add_argument("--disable-extensions")
    #chrome_options.add_argument("--disable-gpu")
    #chrome_options.add_argument("--no-sandbox") # linux only
    chrome_options.add_argument("--headless")
    chrome_options.add_argument('--no-sandbox')  # Bypass OS security model
    # chrome_options.headless = True # also works
    driver = webdriver.Chrome(options=chrome_options)
    start_url = "https://ipa-003.ucd.ie/"
    driver.get(start_url)
    print(driver.page_source.encode("utf-8"))
    if i > 490:
        driver.quit()
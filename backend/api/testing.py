
import time
from selenium import webdriver
from selenium import webdriver
from selenium.webdriver.common.by import By

from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
import unittest
from selenium.webdriver.common.keys import Keys
import unittest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
#driver = webdriver.Chrome()  # Optional argument, if not specified will search path.
from webdriver_manager.chrome import ChromeDriverManager

class PythonOrgSearch(unittest.TestCase):

    def setUp(self):
        #self.driver = webdriver.Firefox()
        option=webdriver.ChromeOptions()
        self.driver = webdriver.Chrome(executable_path='C:/Users/moham/Downloads/chromedriver_win32/chromedriver.exe')

    def test_search_in_python_org(self):
        driver = self.driver
        driver.get('localhost:3000');
        time.sleep(5) # Let the user actually see something!
        print(driver.title)

        search_box = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/div/div/div/input')
        search_box.send_keys('46A') # This searches boosting in Google
        select_first = driver.find_element(By.XPATH, '//*[@id="-141180394"]')
        select_first.click()
        submit_box = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/button')
        submit_box.click()
        assert "No results found." not in driver.page_source
# Better way to do it is
# get all values in a list and get the first index, if you want to be more specific like exact value ucd ( use for loop )
#
# search_box.send_keys(Keys.RETURN)
#         assert "No results found." not in driver.page_source
    def tearDown(self):
        time.sleep(20)  # Let the user actually see something!
        self.driver.close()

if __name__ == "__main__":
    unittest.main()
#driver.quit()





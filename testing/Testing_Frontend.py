
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
#driver = webdriver.Chrome(executable_path='C:/Users/moham/Downloads/chromedriver_win32/chromedriver.exe')
class PythonOrgSearch(unittest.TestCase):

    def setUp(self):
        #self.driver = webdriver.Firefox()
        option=webdriver.ChromeOptions()
        self.driver = webdriver.Chrome(executable_path='C:/Users/moham/Downloads/chromedriver_win32/chromedriver.exe')

    def test_search_stop(self):
        driver = self.driver
       # As a user I want to be able to search for a stop.
        driver.get('localhost:3000');
        time.sleep(5) # Let the user actually see something!
        print(driver.title)

        search_box = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/div/div/div/input')
        search_box.send_keys('46A') # This searches boosting in Google
        time.sleep(5)
        select_first = driver.find_element(By.XPATH, '//*[@id="-141180394"]')
        select_first.click()
        submit_box = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/button')
        submit_box.click()

        #search_box.clear()
        print("Test ok - search bus stop")
        assert "No results found." not in driver.page_source

    def test_real_time(self):
        # As a user I want to see real time information for a stop so that I don’t miss or don’t wait too long for a bus.  
        driver = self.driver
        driver.get('localhost:3000');
        time.sleep(5)
        RealTime_mode = driver.find_element(By.XPATH, '//*[@id="rc-tabs-0-tab-realTime"]')
        RealTime_mode.click()
        print("Test ok - Real Time")
        assert "No results found." not in driver.page_source

        # As a user I want to see updates from Dublin bus twitter.

    def test_twitter(self):
        driver = self.driver
        driver.get('localhost:3000');
        time.sleep(5)
        twitter_mode = driver.find_element(By.XPATH, '//*[@id="rc-tabs-0-tab-news"]')
        twitter_mode.click()
        print("Test ok - Twitter Mode")
        time.sleep(3)
        assert "No results found." not in driver.page_source

        # As a user I want to be able to search for a location (i.e. Dundrum).
    def test_location(self):
        driver = self.driver
        driver.get('localhost:3000');
        search_box2 = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/div/div/div/input')
        time.sleep(2)

        search_box2.click()
        # as the .clear method is not working ill be using this
        search_box2.send_keys(Keys.CONTROL, '')
        #search_box2.clear()

        time.sleep(3)
        search_box2.send_keys("University College Dublin")
        time.sleep(4)

        select_first2 = driver.find_element(By.XPATH, '// *[ @ id = "-626591477"]')
        select_first2.click()
        submit_box = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/button')
        submit_box.click()
        print( "Test ok - Search by location")
        time.sleep(4)
        assert "No results found." not in driver.page_source

        # As a user I want to set common source and destination points
    def test_source_destination(self):
        driver = self.driver
        driver.get('localhost:3000');
        search_box2 = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/div/div/div/input')
        time.sleep(2)

        search_box2.click()
        # as the .clear method is not working ill be using this
        search_box2.send_keys(Keys.CONTROL, '')
        # search_box2.clear()

        time.sleep(3)
        search_box2.send_keys("University College Dublin")
        time.sleep(4)

        select_first2 = driver.find_element(By.XPATH, '// *[ @ id = "-626591477"]')
        select_first2.click()
        # search_box2.send_keys(Keys.CONTROL, '')
        # search_box2.send_keys("University College Dublin")
        # time.sleep(2)
        ## find by title
        direction_button = driver.find_element_by_css_selector("[title^='Directions']")
        direction_button.click()
        print("Clicked Directions")
        search_box3 = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/div[2]/div[1]/div/div/input')
        time.sleep(2)

        search_box3.click()
        # as the .clear method is not working ill be using this
        search_box3.send_keys(Keys.CONTROL, 'Trinity')
        time.sleep(1)
        select_first3 = driver.find_element(By.XPATH, '// *[ @ id = "1847319017"]')

        time.sleep(1)
        select_first3.click()
        submit_box = driver.find_element(By.XPATH, '//*[@id="root"]/div/form/div/div/div[2]/div[2]/button')
        submit_box.click()
        print("Test ok - source & destination ")
        assert "No results found." not in driver.page_source

    # As a user I want to find nearby locations
    def test_nearby_locations(self):

        driver = self.driver
        driver.get('localhost:3000');
        time.sleep(1)
        map_tab = driver.find_element(By.XPATH, '//*[@id="rc-tabs-0-tab-map"]')
        map_tab.click()
        time.sleep(3)
        nearby = driver.find_element(By.XPATH, '// *[ @ id = "map"] / div[2]')
        nearby.click()
        print("Test ok - Nearby")
        assert "No results found." not in driver.page_source

        # As a user I want to be able to Zoom
    def test_zoom(self):
        driver = self.driver
        driver.get('localhost:3000');
        time.sleep(2)
        zoom_in = driver.find_element(By.XPATH, '// *[ @ id = "map"] / div[1] / div / div[7] / div / div / button[1]')
        for i in range(0,3):
         zoom_in.click()
        print("Test ok - Zoom")
        assert "No results found." not in driver.page_source

    





# Better way to do it is
# get all values in a list and get the first index, if you want to be more specific like exact value ucd ( use for loop )
#
# search_box.send_keys(Keys.RETURN)
#         assert "No results found." not in driver.page_source
    def tearDown(self):
        time.sleep(10)  # Let the user actually see something!
        driver = self.driver
        driver.close()

if __name__ == "__main__":
    unittest.main()
#driver.quit()





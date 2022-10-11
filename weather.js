const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const windowWidth = 600;
  const windowHeight = 828;
  const browser = await puppeteer.launch({
    defaultViewport: null,
    args: [`--window-size=${windowWidth},${windowHeight}`],  // 瀏覽器最大化
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false
  });
  // C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe

  const searchArea = ['南港區 天氣','善化區 天氣']
  const weatherReport = {
    today: `${new Date().getFullYear()} 年 ${new Date().getMonth() + 1} 月 ${new Date().getDate()} 日`,
    searchArea: []
  }

  /**
   * @desc 搜尋
   */
  let Search = async(word)=>{
    try{
      let page = await browser.newPage();
      await page.goto('https://www.google.com/'); 
      await page.type('input[title="Google 搜尋"]', `${word}`); 
      await (await page.$('input[title="Google 搜尋"]')).press('Enter');
      await page.waitForSelector('#wob_wc'); 
      const Data = await page.evaluate((sel) => {
        let list = Array.from(document.querySelectorAll(sel))
        let weekWeather = list.map(link => ({
          week: link.querySelector('.Z1VzSb').innerHTML,
          weather: link.querySelector('.uW5pk').getAttribute('alt'),
          temperature: link.querySelector('.gNCp2e > span:nth-child(1)').innerHTML +'~'+ link.querySelector('.QrNVmd > span:nth-child(1)').innerHTML
        }))
    
        let locationWeather = {
          location: document.querySelector('.wob_loc').innerHTML,
          time:  document.querySelector('.wob_dts').innerHTML,
          weekWeather
        }
        return locationWeather
      }, '.wob_df');
      return Data
    }catch(err){
      console.log(err)
    }
  }

  /**
   * @desc 將需要查詢的丟入，注意不可以用forEach
   * {@link https://realdennis.medium.com/%E5%93%A5-%E6%88%91%E5%A5%BD%E6%83%B3%E5%9C%A8-array-%E7%9A%84%E9%AB%98%E9%9A%8E%E5%87%BD%E6%95%B8%E5%89%8D%E9%9D%A2-await%E5%96%94-%E8%A9%B2%E6%80%8E%E9%BA%BC%E5%81%9A%E5%91%A2-2d75e07e3adb}
   */
  await Promise.all(searchArea.map(async (word) => { //這邊不能用forEach 請看此蚊帳 
    let data = await Search(word)
    weatherReport.searchArea.push(data)
  }));

  /**
   * @desc 一起關閉視窗
   */
  await browser.close(); // 關閉瀏覽器
  fs.createWriteStream('weatherReport.json').write(JSON.stringify(weatherReport)) //轉JSON
})();
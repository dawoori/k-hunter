const puppeteer = require("puppeteer");
const axios = require("axios");

const ID = process.env.ID;
const PASSWD = process.env.PASSWD;
const WEBHOOKS = process.env.WEBHOOKS;
const LECTURE_CODE = ["058972", "015895", "132500"];
const LECTURE_NAME = ["소프트웨어디자인패턴", "네트워크서비스프로토콜", "빅데이터플랫폼"];

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto('http://ktis.kookmin.ac.kr');

    await page.evaluate((id, pw) => {
      document.querySelector('#txt_user_id').value = id;
      document.querySelector('#txt_passwd').value = pw;
    }, ID, PASSWD);

    await page.evaluate(() => { document.querySelectorAll('input')[2].click(); });
    await page.waitForNavigation();


    const leftFrame = (await page.frames())[2];
    const mainFrame = (await page.frames())[3];

    await leftFrame.evaluate(() => { document.querySelector('#수강정보').click(); });
    await leftFrame.evaluate(() => { document.querySelector('#수강정보Usb0101e').click(); });
    await page.waitFor(2000);

    const lectureList = (await page.frames())[6];

    for(let i = 0; i < LECTURE_CODE.length; i++) {
      await mainFrame.evaluate(() => { document.querySelector('body > table > tbody > tr > td > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(7) > input[type=radio]:nth-child(2)').click(); });
      await mainFrame.evaluate((code, i) => { document.querySelector('#layer1 > form > table > tbody > tr > td:nth-child(2) > input[type=text]').value = code[i]; }, LECTURE_CODE, i);
      await mainFrame.evaluate(() => { document.querySelector('body > table > tbody > tr > td > table:nth-child(5) > tbody > tr > td:nth-child(2) > a').click(); });
    
      await page.waitFor(1000);

      const lectureString = await lectureList.evaluate(() => {
        const cName = document.querySelector('body > table').childNodes[1].children[0].children[3].outerHTML;
        return cName;
      });

      if(!lectureString.includes("red")) {
        axios({
          method: "post",
          url: WEBHOOKS,
          data: {
            text: `${LECTURE_NAME[i]} 수강신청 가능!!`,
          },
        });
      }
      
    }

    await page.screenshot({path: 'example.png'});
    await browser.close();
  })();

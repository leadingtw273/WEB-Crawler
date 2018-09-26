import fs from 'fs';
import url from 'url';
import request from 'request';
import cheerio from 'cheerio';

const baseUrl = url.parse('https://www.ptt.cc/');

// dom資料爬取格式
const domDataSet = dom => ({
  title: dom.text(),
  link: url.resolve(baseUrl.href, dom.attr('href')),
  timestamp: dom.attr('href').substr(15, 10)
});

// 取得單頁資料
const getPageDataList = (searchRegExp, link) =>
  new Promise(resolve => {
    const opt = {
      url: link,
      headers: {
        Cookie: 'over18=1'
      }
    };
    request(opt, (err, res, body) => {
      const $ = cheerio.load(body);
      // 抓取文章列表
      let list = $('.r-ent a')
        .map((index, obj) => domDataSet($(obj)))
        .get();

      list = list.filter(post => {
        const arr = searchRegExp.exec(post.title);
        const i = 1;
        if (arr !== null) {
          post.find = arr[i];
          return true;
        }
        return false;
      });

      return resolve(list);
    });
  });

// 取得最新頁面index
const getLastPageIndex = link =>
  new Promise(resolve => {
    const opt = {
      url: link,
      headers: {
        Cookie: 'over18=1'
      }
    };
    request(opt, (err, res, body) => {
      const $ = cheerio.load(body);

      // 抓取最新頁數
      const prePageUrl = $('.btn-group-paging a')
        .filter((i, el) => $(el).text() === '‹ 上頁')
        .attr('href');
      const lastUrlIndex =
        parseInt(
          prePageUrl
            .split('/')
            .pop()
            .slice(5, -5),
          10
        ) + 1;
      console.log(lastUrlIndex);

      resolve(lastUrlIndex);
    });
  });

// 取得PPT頁面URL
const getPageUrl = (link, index) => link.replace(/index\d*/, `index${index}`);

// 主要執行
const main = config =>
  getLastPageIndex(config.URL).then(async val => {
    let data = [];
    let dataList = [];
    let targetUrl = '';

    // 爬取指定數量資料，最多不超過50頁
    console.log(config.REGEXP);
    for (let i = 0; dataList.length < config.DATA_COUNT; i += 1) {
      targetUrl = getPageUrl(config.URL, val - i);
      data = await getPageDataList(config.REGEXP, targetUrl);
      dataList = dataList.concat(data);
      if (i > 50) {
        console.log('頁數大於50頁 中斷搜索');
        break;
      } else {
        console.log(`${targetUrl} => ${data.length} 筆比對成功資料`);
      }
    }

    // 排列並篩至指定數量資料
    dataList.sort((a, b) => b.timestamp - a.timestamp);
    const dd = dataList.filter((dataVal, index) => index < config.DATA_COUNT);

    // 輸出至指定檔案
    try {
      fs.writeFileSync(
        './lib/RegExpTest/data.json',
        JSON.stringify({ dataList: dd.map(x => x.title) })
      );
    } catch (err) {
      console.log(err);
    }

    return dd;
  });

export default main;

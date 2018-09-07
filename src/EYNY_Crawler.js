import fs from 'fs';
import path from 'path';
import url from 'url';
import request from 'request';
import cheerio from 'cheerio';

const baseUrl = url.parse('https://www.eyny.com/search.php?searchsubmit=yes');
const authUrl = url.parse(
  'https://www.eyny.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=LJ8fW&inajax=1'
);

const headers = {
  Connection: 'keep-alive',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  Origin: 'https://www.eyny.com',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
};

const DATA_LIST_SELECTOR = '#threadlist > div > table > tbody > tr > th a';
const NEXT_PAGE_BUTTON_SELECTOR =
  '#threadlist > table:nth-child(1) > tbody > tr > td:nth-child(3) > div.pgs.cl.mbm > div > a.nxt';
const FICTION_IMAGE_SELECTOR =
  '#postlist > div:nth-child(3) > table > tbody > tr:nth-child(1) > td.plc > div.pct > div.pcb > div.t_fsz > table > tbody > tr > td > ignore_js_op > img';
const FICTION_CONTENT_SELECTOR =
  '#postlist > div > table > tbody > tr:nth-child(1) > td.plc > div.pct > div.pcb > div.t_fsz > table > tbody > tr > td';

const searchKeyWord = 'OVERLORD';
const username = 'leadingtwTest1';
const password = 'SWemegPycsempA2';

const to = promise => promise.then(data => [null, data]).catch(err => [err]);
const composeUrl = urlPath => url.resolve(baseUrl.href, urlPath);
const findDom = (dom, target) => dom.find(target).length > 0;
const domDataSet = dom => ({
  title: dom.text(),
  link: url.resolve(baseUrl.href, dom.attr('href'))
});

const getAuth = () =>
  new Promise((resolve, reject) => {
    const opt = {
      url: authUrl.href,
      method: 'POST',
      form: {
        username,
        password
      },
      headers,
      timeout: 60000
    };

    request(opt, (err, res) => {
      if (err) return reject(err);

      const reg = new RegExp('.*auth.*');
      headers.Cookie = res.headers['set-cookie']
        .find(ele => reg.test(ele))
        .split(';')
        .shift();

      console.log(
        `getAuth \n complete: <${res.statusCode}> => ${headers.Cookie}`
      );
      return resolve(res.headers['set-cookie']);
    });
  });

const getSrchPage = () =>
  new Promise((resolve, reject) => {
    const opt = {
      url: baseUrl,
      method: 'POST',
      form: {
        mod: 'curforum',
        srhfid: '1777',
        srchtxt: searchKeyWord
      },
      headers,
      timeout: 60000
    };

    request(opt, (err, res) => {
      if (err) return reject(err);
      const srchLink = composeUrl(res.headers.location);

      console.log(
        `getSrchPage \n complete: <${res.statusCode}> => ${srchLink}`
      );
      return resolve(srchLink);
    });
  });

const getFictionPage = targetUrl =>
  new Promise((resolve, reject) => {
    const opt = {
      url: targetUrl,
      headers,
      timeout: 60000
    };
    let nextPage = false;
    let target = false;

    request(opt, (err, res, body) => {
      if (err) return reject(err);

      const $ = cheerio.load(body);

      if (!findDom($(body), DATA_LIST_SELECTOR)) {
        target = false;
      } else {
        target = $(DATA_LIST_SELECTOR)
          .map((index, obj) => domDataSet($(obj)))
          .get();
      }

      if (!findDom($(body), NEXT_PAGE_BUTTON_SELECTOR)) {
        nextPage = false;
      } else {
        nextPage = composeUrl($(NEXT_PAGE_BUTTON_SELECTOR).attr('href'));
      }

      console.log(
        `getFictionPage \n complete: <${res.statusCode}> => ${{
          nextPage,
          target
        }}`
      );
      return resolve({ nextPage, target });
    });
  });

const getFictionPageList = link =>
  new Promise(async (resolve, reject) => {
    const list = [];
    let err = null;
    let data = null;
    let targetLink = link;

    while (true) {
      [err, data] = await to(getFictionPage(targetLink));
      if (err) return reject(err);

      list.push(data.target);

      if (data.nextPage) {
        targetLink = data.nextPage;
      } else {
        break;
      }
    }

    const pageList = list.reduce((a, b) => a.concat(b), []);
    console.log(`getFictionPageList \n complete: ${pageList}`);
    return resolve(pageList);
  });

const getFictionData = content =>
  new Promise((resolve, reject) => {
    const opt = {
      url: content.link,
      method: 'GET',
      headers,
      timeout: 60000
    };

    request(opt, (err, res, body) => {
      if (err) return reject(err);

      const $ = cheerio.load(body);

      const data = {
        content: $(FICTION_CONTENT_SELECTOR)
          .map((index, obj) => $(obj).text())
          .get(),
        img: $(FICTION_IMAGE_SELECTOR)
          .map((index, obj) => $(obj).attr('file'))
          .get(),
        title: content.title
      };

      console.log(
        `getFictionData \n complete: <${res.statusCode}> => ${data.title}`
      );
      return resolve(data);
    });
  });

const getFictionDataList = pageList =>
  new Promise(async (resolve, reject) => {
    const pageInfo = [];
    let err = null;
    let data = null;

    for (const ele of pageList) {
      [err, data] = await to(getFictionData(ele));
      if (err) return reject(err);

      pageInfo.push(data);
    }

    console.log(`getFictionDataList \n complete: ${pageInfo}`);
    return resolve(pageInfo);
  });

getAuth()
  .then(getSrchPage)
  .then(getFictionPageList)
  .then(getFictionDataList)
  .then(data => {
    if (!fs.existsSync(path.join(__dirname, `../fictions/${searchKeyWord}/`))) {
      fs.mkdirSync(`./fictions/${searchKeyWord}`);
      console.log('路徑已創建');
    }

    data.forEach((ele, index) => {
      fs.writeFileSync(
        `./fictions/${searchKeyWord}/${ele.title}.txt`,
        ele.content
      );
      fs.writeFileSync(
        `./fictions/${searchKeyWord}/index.txt`,
        `(${index + 1}): ${ele.title}\n`,
        { flag: 'a' }
      );

      console.log(`fiction write to file done! => ${ele.title}`);
    });

    console.log('\ndone.');
  })
  .catch(err => {
    console.log(err);
  });

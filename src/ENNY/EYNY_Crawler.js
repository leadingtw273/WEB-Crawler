import fs from 'fs';
import path from 'path';
import url from 'url';
import request from 'request';
import cheerio from 'cheerio';
import { autoUrl, headers, SELECTOR, AUTH } from './config';

const baseUrl = url.parse(autoUrl.sch);
const authUrl = url.parse(autoUrl.login);

const { username } = AUTH;
const { password } = AUTH;

const searchKeyWord = '哥布林殺手';

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

const getSchPage = () =>
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
      const schLink = composeUrl(res.headers.location);

      console.log(`getSchPage \n complete: <${res.statusCode}> => ${schLink}`);
      return resolve(schLink);
    });
  });

const getFictionPage = targetUrl =>
  new Promise((resolve, reject) => {
    const opt = {
      url: targetUrl,
      headers,
      timeout: 60000
    };

    request(opt, (err, res, body) => {
      if (err) return reject(err);

      const $ = cheerio.load(body);
      let nextPage = false;
      let target = false;

      if (findDom($(body), SELECTOR.DATA_LIST)) {
        target = $(SELECTOR.DATA_LIST)
          .map((index, obj) => domDataSet($(obj)))
          .get();
      }

      if (findDom($(body), SELECTOR.NEXT_PAGE_BUTTON)) {
        nextPage = composeUrl($(SELECTOR.NEXT_PAGE_BUTTON).attr('href'));
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
        content: $(SELECTOR.FICTION_CONTENT)
          .map((index, obj) => $(obj).text())
          .get(),
        img: $(SELECTOR.FICTION_IMAGE)
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

const createFictionFile = data =>
  new Promise((resolve, reject) => {
    try {
      if (
        !fs.existsSync(path.join(__dirname, `../fictions/${searchKeyWord}/`))
      ) {
        fs.mkdirSync(`./fictions/${searchKeyWord}`);
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
    } catch (err) {
      reject(err);
    }
    resolve();
  });

getAuth()
  .then(getSchPage)
  .then(getFictionPageList)
  .then(getFictionDataList)
  .then(createFictionFile)
  .then(() => {
    console.log('\n finish');
  })
  .catch(err => {
    console.log(err);
  });

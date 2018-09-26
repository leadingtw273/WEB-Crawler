import RegCreate from './RegCreate';
import PPT from './PTT_Crawler';

const setUrl = Config => {
  const defaultUrlConfig = {
    protocal: 'https',
    host: 'www.ptt.cc',
    path: ['bbs', 'CodeJob'],
    file: 'index',
    extension: 'html'
  };
  const urlConfig = Object.assign(defaultUrlConfig, Config);
  return `${urlConfig.protocal}://${urlConfig.host}/${urlConfig.path.join(
    '/'
  )}/${urlConfig.file}.${urlConfig.extension}`;
};

// 初始值
const configTotal = {
  DATA_COUNT: 50,
  URL: setUrl({ path: ['bbs', 'CodeJob'] }),
  REGEXP: RegCreate({
    title: '發案',
    notHave: ['已徵到', '已過期', '洽談中', '已結案', '已徵得', '已解決'],
    orHave: []
  })
};
//

PPT(configTotal)
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });

// const WC = new WebCrawler({ url: setUrl(), header: { Cookie: 'over18=1' } });
// const run = async () => {
//   const data = await WC.getHtmlDom();
//   console.log(data);
// };
// run();

import { describe, it } from 'mocha';
import should from 'should';
import regCreate from '../RegCreate';

describe('#RegCreate', () => {
  it('參數型態錯誤 應該丟出一個Error', (done) => {
    (() => regCreate(true)).should.throw(Error('input type must be string or object'));
    (() => regCreate([123, 'asd'])).should.throw(Error('input type must be string or object'));
    (() => regCreate(123)).should.throw(Error('input type must be string or object'));
    done();
  });

  it('無參數輸入 應該搜尋所有', (done) => {
    const regexp = regCreate();
    [
      '[發案] RoR網站SSL憑證及FB Pixel安裝',
      '[發案] ASP網站微修改及移機(洽中 謝謝)',
      '[發案]投資業尋找程式設計師',
      '[發案] 電商網站前端外包(已徵到)',
      '[發案] Java Web 除錯（已解決)',
      '[已徵得] Wordpress(Woocommerce)銀行金流串接',
      '[已結案] 財政部API串接',
      '[個人] iOS幫簽企業版ipa',
      '[公司] 新創手遊 徵正職Unity (Android)工程師',
      '[討論] 一個小小網站爛攤子怎報價',
    ].should.matchEach(regexp);
    done();
  });

  it('輸入 {title: "發案", notHave: ["已徵得", "已徵到"], orHave: [ "網站", "java"]} 查找對應的資料', (done) => {
    const Config = {
      title: '發案',
      notHave: ['已徵得', '已徵到'],
      orHave: ['網站', 'java'],
    };
    const regexp = regCreate(Config);

    [
      '[發案] JAVA程式撰寫',
      '[發案] RoR網站SSL憑證及FB Pixel安裝',
      '[發案] ROR 網站參數抓取，並傳遞到下一頁',
    ].should.matchEach(regexp);

    '[發案] 公司會員資料庫系統建置案'.should.not.match(regexp);
    '[公司] 新創手遊 徵正職Unity (Android)工程師'.should.not.match(regexp);
    '[發案] 教學安裝centos6.4 網頁伺服器(已徵得)'.should.not.match(regexp);

    done();
  });

  it('輸入 {title: "發案"} 查找對應的資料', (done) => {
    const Config = {
      title: '發案',
    };
    const regexp = regCreate(Config);

    [
      '[發案] RoR網站SSL憑證及FB Pixel安裝',
      '[發案] ASP網站微修改及移機(洽中 謝謝)',
      '[發案]投資業尋找程式設計師',
      '[發案] 電商網站前端外包(已徵到)',
      '[發案] Java Web 除錯（已解決)',
    ].should.matchEach(regexp);

    '[個人] iOS幫簽企業版ipa'.should.not.match(regexp);
    '[已徵得] Wordpress(Woocommerce)銀行金流串接'.should.not.match(regexp);
    '[已結案] 財政部API串接'.should.not.match(regexp);
    '[討論] 一個小小網站爛攤子怎報價'.should.not.match(regexp);
    '[討論] 一個小小網站爛攤子怎報價'.should.not.match(regexp);
    '[公司] 新創手遊 徵正職Unity (Android)工程師'.should.not.match(regexp);

    done();
  });

  it('輸入 {notHave: ["已結案","已徵到","手遊"]} 查找對應的資料', (done) => {
    const Config = {
      notHave: ['已結案', '已徵到', '手遊'],
    };
    const regexp = regCreate(Config);
    [
      '[發案] RoR網站SSL憑證及FB Pixel安裝',
      '[發案] ASP網站微修改及移機(洽中 謝謝)',
      '[發案]投資業尋找程式設計師(已徵得))',
      '[個人] iOS幫簽企業版ipa',
      '[討論] 一個小小網站爛攤子怎報價',
    ].should.matchEach(regexp);

    '[發案] 電商網站前端外包(已徵到)'.should.not.match(regexp);
    '[個人] 財政部API串接(已結案)'.should.not.match(regexp);
    '[公司] 新創手遊 徵正職Unity (Android)工程師'.should.not.match(regexp);

    done();
  });

  it('輸入 {orHave: ["爬蟲","網站","java"]} 查找對應的資料', (done) => {
    const Config = {
      orHave: ['爬蟲', '網站', 'java'],
    };
    const regexp = regCreate(Config);
    [
      '[發案] Java/Oracle 大型項目徵求長期(一年以上)外包人員',
      '[發案] ASP網站微修改及移機(洽中 謝謝)',
      '[發案] 爬蟲',
      '[個人] Ragic 徵合作夥伴(Java/JavaScript/API)',
      '[討論] 一個小小網站爛攤子怎報價',
    ].should.matchEach(regexp);

    '[發案] 公司會員資料庫系統建置案'.should.not.match(regexp);
    '[公司] 新創手遊 徵正職Unity (Android)工程師'.should.not.match(regexp);
    '[發案] 已經在討論篩選中,謝謝大家!python跟C++ 修改 gimp 原始碼'.should.not.match(regexp);

    done();
  });
});

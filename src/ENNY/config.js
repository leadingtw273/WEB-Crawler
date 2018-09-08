export default {
  baseUrl: {
    sch: 'https://www.eyny.com/search.php?searchsubmit=yes',
    login:
      'https://www.eyny.com/member.php?mod=logging&action=login&loginsubmit=yes&loginhash=LJ8fW&inajax=1'
  },
  headers: {
    Connection: 'keep-alive',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    Origin: 'https://www.eyny.com',
    'Upgrade-Insecure-Requests': 1,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
  },
  SELECTOR: {
    DATA_LIST: '#threadlist > div > table > tbody > tr > th a',
    NEXT_PAGE_BUTTON:
      '#threadlist > table:nth-child(1) > tbody > tr > td:nth-child(3) > div.pgs.cl.mbm > div > a.nxt',
    FICTION_IMAGE:
      '#postlist > div:nth-child(3) > table > tbody > tr:nth-child(1) > td.plc > div.pct > div.pcb > div.t_fsz > table > tbody > tr > td > ignore_js_op > img',
    FICTION_CONTENT:
      '#postlist > div > table > tbody > tr:nth-child(1) > td.plc > div.pct > div.pcb > div.t_fsz > table > tbody > tr > td'
  },
  AUTH: { username: 'leadingtwTest1', password: 'SWemegPycsempA2' }
};

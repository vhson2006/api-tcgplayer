import * as fs from 'fs';
import { crawlData } from './crawler';
import { sliceIntoChunks, wait } from './array';

export const links = [
  { link: 'https://phatdatbinhthoi.com.vn/hot-trend-hang-dien-tu-dien-may-chinh-hang-/', page: 20 },
  { link: 'https://phatdatbinhthoi.com.vn/linh-kien-vi-tinh-/', page: 39 },
  { link: 'https://phatdatbinhthoi.com.vn/nha-bep-/', page: 26 },
  { link: 'https://phatdatbinhthoi.com.vn/sim--dien-thoai--laptop-desktop-casio-/', page: 3 },
  { link: 'https://phatdatbinhthoi.com.vn/cap-mangcap-camera-/', page: 5 },
  { link: 'https://phatdatbinhthoi.com.vn/the-nho-usb-loa-the-nho-/', page: 6 },
  { link: 'https://phatdatbinhthoi.com.vn/thiet-bi-mang-/', page: 9 },
  { link: 'https://phatdatbinhthoi.com.vn/den-cac-loai-/', page: 21 },
  { link: 'https://phatdatbinhthoi.com.vn/do-diendo-gia-dung-/', page: 61 },
  { link: 'https://phatdatbinhthoi.com.vn/sung-kho-khoa-quet-gas-/', page: 5 },
  { link: 'https://phatdatbinhthoi.com.vn/coc-captai-nghe-dien-thoai-/', page: 9 },
  { link: 'https://phatdatbinhthoi.com.vn/tui-cap-balo-laptop-/', page: 4 },
  { link: 'https://phatdatbinhthoi.com.vn/case-nguon-fan-case-/', page: 11 },
  { link: 'https://phatdatbinhthoi.com.vn/linh-kien-dien-thoai-pin-pin-du-phong-livestream-/', page: 11 },
  { link: 'https://phatdatbinhthoi.com.vn/camera-va-linh-kien-camera-chinh-hang-/', page: 32 },
  { link: 'https://phatdatbinhthoi.com.vn/man-hinh-lcdmay-in-/', page: 11 },
  { link: 'https://phatdatbinhthoi.com.vn/keyboard-mouse-/', page: 17 },
  { link: 'https://phatdatbinhthoi.com.vn/loa-bluetooth-loa-vi-tinh-loa-keo-karaoke-/', page: 18 },
  { link: 'https://phatdatbinhthoi.com.vn/tai-nghe-bluetooth-moc-khoa-/', page: 4 },
  { link: 'https://phatdatbinhthoi.com.vn/headphone-bluetooth-headphone-vi-tinh-/', page: 2 },
  { link: 'https://phatdatbinhthoi.com.vn/danh-cho-be-do-choi-/', page: 20 },
  { link: 'https://phatdatbinhthoi.com.vn/dong-ho-mat-kinh-khau-trang-bop-da-balo-ao-mua-du-ong-nhom-moc-khoa-/', page: 16 },
  { link: 'https://phatdatbinhthoi.com.vn/massage-lam-toc-gym-nuoc-hoa-phu-kien-nail-/', page: 19 },
  { link: 'https://phatdatbinhthoi.com.vn/box-smart-air-mouse-mic-karaoke-/', page: 3 },
  { link: 'https://phatdatbinhthoi.com.vn/voi-sen-lucky-xit-loc-nuoc-/', page: 5 },
  { link: 'https://phatdatbinhthoi.com.vn/linh-kien-otoxe-may-/', page: 7 },
  { link: 'https://phatdatbinhthoi.com.vn/thiet-bi-van-phong-pham-hang-phong-thuy-/', page: 18 },
]

const loop = async (data: any) => {
  if (data.length > 0) {
    const element = data.pop();
    const results = await element.reduce(async (pre: any, cur: any) => {
      const products = await crawlData(
        cur,
        '#product-wrap',
        '.item-product',
        transferItem
      );
      return [
        ...await pre,
        ...products.map((p) => ({...p, tags: cur.replace('https://phatdatbinhthoi.com.vn/', '').split('/')[0]}))
      ]
    }, [])
    
    fs.writeFile(`data/myjsonfile${data.length}.json`, JSON.stringify(results), 'utf8', (err) => {if(err) console.log(err)});
    console.log(`write file ${data.length}`)
    await wait(500)
    return await loop(data)
  } else {
    return
  }
  
}
const transferItem = (item: any) => ({
  name: item.querySelector('.name').textContent.replace(/[\t\n]/gm, ''),
  price: item.querySelector('.price > span').textContent.replace(/[\t\n]/gm, ''),
  img: item.querySelector('img').src,
  link: item.querySelector('a').href,
})

const crawlFromPhatDat = async () => {
  const rawList = links.reduce((all, cur, curIndex) => {
    const { link, page } = cur;
    for (let i = 0; i < page; i++) {
      all.push(link + `&p=${i + 1}`);
    }
    return all;
  }, []);
  
  await loop(sliceIntoChunks(rawList, 10))
}

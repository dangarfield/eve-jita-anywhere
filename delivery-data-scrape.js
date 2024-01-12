import { parse } from 'node-html-parser'
import fs from 'fs'
import path from 'path'

const beginScrape = async () => {
  console.log('beginScrape')
  const req = await fetch('https://www.pushx.net/rates.php')
  const res = await req.text()
  console.log('res', res)
  const root = parse(res)
  const DATA = {
    HS_BR_COLLATERAL: parseInt(root.querySelector('.rates-panel-hs-br .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    HS_BR_WARP: parseInt(root.querySelector('.rates-panel-hs-br .rates-content .rates-price b').innerText.replace(/[^0-9]/g, '')),
    HS_BR_RUSH: parseInt(root.querySelector('.rates-panel-hs-br .rates-content:not(.rates-highsec) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    HS_DST_COLLATERAL: parseInt(root.querySelector('.rates-panel-hs-dst .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    HS_DST_WARP: parseInt(root.querySelector('.rates-panel-hs-dst .rates-content .rates-price b').innerText.replace(/[^0-9]/g, '')),
    HS_DST_RUSH: parseInt(root.querySelector('.rates-panel-hs-dst .rates-content:not(.rates-highsec) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    HS_FR_COLLATERAL: parseInt(root.querySelector('.rates-panel-hs-freighter .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    HS_FR_WARP_1: parseInt(root.querySelector('.rates-panel-hs-freighter .rates-content:nth-child(2) .rates-price:nth-child(3)').innerText.replace(/[^0-9]/g, '')),
    HS_FR_WARP_2: parseInt(root.querySelector('.rates-panel-hs-freighter .rates-content:nth-child(2) .rates-price:nth-child(5)').innerText.replace(/[^0-9]/g, '')),
    HS_FR_WARP_LARGE: parseInt(root.querySelector('.rates-panel-hs-freighter .rates-content:nth-child(2) .rates-price:nth-child(7)').innerText.replace(/[^0-9]/g, '')),
    HS_FR_RUSH: parseInt(root.querySelector('.rates-panel-hs-freighter .rates-content:nth-child(4) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    HS_JF_COLLATERAL: parseInt(root.querySelector('.rates-panel-hs-jf .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    HS_JF_BASE: parseInt(root.querySelector('.rates-panel-hs-jf .rates-content:nth-child(2) .rates-price:nth-child(3)').innerText.replace(/[^0-9]/g, '')),
    HS_JF_WARP: parseInt(root.querySelector('.rates-panel-hs-jf .rates-content:nth-child(2) .rates-price:nth-child(5)').innerText.replace(/[^0-9]/g, '')),
    HS_JF_RUSH: parseInt(root.querySelector('.rates-panel-hs-jf .rates-content:nth-child(4) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    LS_BR_COLLATERAL: parseInt(root.querySelector('.rates-panel-ls-br .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    LS_BR_WARP: parseInt(root.querySelector('.rates-panel-ls-br .rates-content .rates-price b').innerText.replace(/[^0-9]/g, '')),
    LS_BR_RUSH: parseInt(root.querySelector('.rates-panel-ls-br .rates-content:not(.rates-lowsec) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    LS_JF_COLLATERAL: parseInt(root.querySelector('.rates-panel-ls-jf .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    LS_JF_BASE: parseInt(root.querySelector('.rates-panel-ls-jf .rates-content:nth-child(2) .rates-price:nth-child(3)').innerText.replace(/[^0-9]/g, '')),
    LS_JF_WARP: parseInt(root.querySelector('.rates-panel-ls-jf .rates-content:nth-child(2) .rates-price:nth-child(5)').innerText.replace(/[^0-9]/g, '')),
    LS_JF_RUSH: parseInt(root.querySelector('.rates-panel-ls-jf .rates-content:nth-child(4) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    NS_JF_COLLATERAL: parseInt(root.querySelector('.rates-panel-ns-jf .rates-header').innerText.split('-')[1].replace(/[^0-9]/g, '')) * 1e9,
    NS_JF_BASE: parseInt(root.querySelector('.rates-panel-ns-jf .rates-content:nth-child(2) .rates-price:nth-child(3)').innerText.replace(/[^0-9]/g, '')),
    NS_JF_WARP: parseInt(root.querySelector('.rates-panel-ns-jf .rates-content:nth-child(2) .rates-price:nth-child(5)').innerText.replace(/[^0-9]/g, '')),
    NS_JF_RUSH: parseInt(root.querySelector('.rates-panel-ns-jf .rates-content:nth-child(4) .rates-price b').innerText.replace(/[^0-9]/g, '')),

    MIN_CHARGE: parseInt(root.querySelector('tr:nth-child(9) .rates-label').innerText.replace(/[^0-9]/g, ''))
  }
  console.log(DATA)
  if (!fs.existsSync(path.join('frontend', 'public', 'generated-delivery-data'))) {
    fs.mkdirSync(path.join('frontend', 'public', 'generated-delivery-data'))
  }
  fs.writeFileSync(path.join('frontend', 'public', 'generated-delivery-data', 'delivery-data.json'), JSON.stringify(DATA))
}
beginScrape()
// const el = root.querySelector('tr td:nth-child(2)');

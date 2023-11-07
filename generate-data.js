/* eslint-disable camelcase */
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import stream from 'stream'

import axios from 'axios'
import AdmZip from 'adm-zip'
import bz2 from 'unbzip2-stream'
import tarfs from 'tar-fs'
import decompress from 'decompress'
import decompressTarxz from 'decompress-tarxz'

const downloadAndUnzip = async (url, unzipPath, folderName) => {
  try {
    const unzipPathPath = path.join(unzipPath)
    if (!fs.existsSync(unzipPathPath)) fs.mkdirSync(unzipPathPath)
    console.log('downloadAndUnzip', url, unzipPath, folderName)
    if (fs.existsSync(path.join(unzipPath, folderName))) return
    // if (fs.readdirSync(unzipPathPath).length > 0) return
    console.log('downloadAndUnzip execute', url, unzipPath, folderName)
    const response = await axios.get(url, { responseType: 'stream' })
    const zipFileName = path.basename(url)
    const zipFilePath = path.join(unzipPath, zipFileName)

    response.data.pipe(fs.createWriteStream(zipFilePath))

    await new Promise((resolve, reject) => {
      response.data.on('end', resolve)
      response.data.on('error', reject)
    })

    await fs.promises.mkdir(unzipPath, { recursive: true })

    const zip = new AdmZip(zipFilePath)
    zip.extractAllTo(unzipPath, true)

    fs.unlinkSync(zipFilePath) // Remove the downloaded zip file

    console.log('Download and unzip successful!')
    console.log('fs.readdirSync(unzipPathPath)', fs.readdirSync(unzipPathPath))
  } catch (error) {
    console.error('Error:', error.message)
  }
}
const downloadTar = async (url, folder) => {
  try {
    console.log('downloadTarBZ2 - START', url)
    const response = await axios.get(url, { responseType: 'stream' })
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
    const tempPath = path.join(folder, 'temp')
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(tempPath)
      response.data.pipe(writer) // Pipe the HTTP response to the file
      writer.on('finish', resolve) // Wait for the file to finish downloading
      writer.on('error', reject)
    })
    const pipeline = promisify(stream.pipeline)
    if (url.endsWith('.tar.bz2')) {
      await pipeline(fs.createReadStream(tempPath), bz2(), tarfs.extract(folder))
    } else if (url.endsWith('.tar.xz')) {
      await decompress(tempPath, folder, {
        plugins: [
          decompressTarxz()
        ]
      })
      // } else {
    }
    fs.unlinkSync(tempPath)
    console.log('downloadTarBZ2 - END')
  } catch (error) {
    console.error('downloadTarBZ2 - ERROR', error.message)
  }
}

const generateTypeData = async () => {
  const marketGroups = JSON.parse(fs.readFileSync('_data/reference-data/market_groups.json'))
  const types = JSON.parse(fs.readFileSync('_data/reference-data/types.json'))
  console.log('marketGroups', Object.keys(marketGroups).length, 'types', Object.keys(types).length)

  // Function to create a recursive structure for a market group
  const createMarketGroupStructure = (marketGroup) => {
    const group = {
      market_group_id: marketGroup.market_group_id,
      name: marketGroup.name.en,
      icon_id: marketGroup.icon_id ? marketGroup.icon_id : 0,
      parent_group_id: marketGroup.parent_group_id || 0
    }

    if (marketGroup.type_ids) {
      group.types = marketGroup.type_ids
        .map(type_id => types[type_id])
        .filter(type => type.published)
        .map(type => {
          return { type_id: type.type_id, name: type.name.en, icon_id: type.icon_id, is_type: true, parent_group_id: marketGroup.market_group_id, volume: type.volume }
        })
    }
    if (marketGroup.child_market_group_ids) {
      group.child_groups = marketGroup.child_market_group_ids.map((childId) =>
        createMarketGroupStructure(marketGroups[childId])
      )
      group.child_groups.sort((a, b) => a.name.localeCompare(b.name))
    }

    return group
  }
  const findUniqueIconIds = (node) => {
    const uniqueIconIds = new Set()

    if (node.icon_id !== undefined) {
      uniqueIconIds.add(node.icon_id)
    }
    // console.log('node', node.child_groups)
    if (node.child_groups) {
      // console.log('child')
      for (const child of node.child_groups) {
        const childIconIds = findUniqueIconIds(child)
        childIconIds.forEach((iconId) => uniqueIconIds.add(iconId))
      }
    }
    // if (node.types) {
    //   for (const type of node.types) {
    //     const typeIconIds = findUniqueIconIds(type)
    //     typeIconIds.forEach((iconId) => uniqueIconIds.add(iconId))
    //   }
    // }
    return Array.from(uniqueIconIds).sort((a, b) => a - b)
  }

  // Get root nodes
  const rootNodes = Object.values(marketGroups)
    .filter(m => m.parent_group_id === undefined)
    .sort((a, b) => a.name.en.localeCompare(b.name.en))
    .map(m => {
      return createMarketGroupStructure(m)
    })
    // .map(m => {
    //   const group = {
    //     market_group_id: m.market_group_id,
    //     name: m.name.en,
    //     icon_id: m.icon_id,
    //     parent_group_id: m.parent_group_id
    //   }

  //   if (m.type_ids) {
  //     group.types = m.type_ids.map((type_id) => {
  //       const type = types[type_id]
  //       return { type_id, name: type.name.en, icon_id: type.icon_id, is_type: true }
  //     })
  //   }
  //   if (m.child_market_group_ids) {
  //     group.child_market_group_ids = m.child_market_group_ids
  //   // group.child_groups = marketGroup.child_market_group_ids.map((childId) =>
  //   //   createMarketGroupStructure(marketGroups[childId])
  //   // )
  //   // group.child_groups.sort((a, b) => a.name.localeCompare(b.name))
  //   }
  //   return group
  // })

  console.log('rootNodes', rootNodes.length)
  if (!fs.existsSync('frontend/public')) fs.mkdirSync('frontend/public')
  if (!fs.existsSync('frontend/public/generated-data')) fs.mkdirSync('frontend/public/generated-data')
  fs.writeFileSync('frontend/public/generated-data/market-types.json', JSON.stringify(rootNodes))

  if (!fs.existsSync('frontend/public/generated-icons')) fs.mkdirSync('frontend/public/generated-icons')
  const uniqueIconIds = findUniqueIconIds({ child_groups: rootNodes })
  const icons = JSON.parse(fs.readFileSync('_data/reference-data/icons.json'))
  console.log('uniqueIconIds', uniqueIconIds)
  uniqueIconIds.forEach(icon_id => {
    let fromPath = '_data/Icons/items/5_64_10.png' // Default
    if (icons[icon_id].icon_file.toLowerCase().startsWith('res:/ui/texture/icons/')) {
      const potentialFromPath = path.join(icons[icon_id].icon_file
        .replace('res:/ui/texture/icons/', '_data/Icons/items/')
        .replace('res:/UI/Texture/Icons/', '_data/Icons/items/')
        .replace('/inventory/', '/Inventory/')
      )
      if (icon_id === 20959) {
        console.log('i', icon_id, 'potentialFromPath', potentialFromPath, fs.existsSync(potentialFromPath), icons[icon_id].icon_file)
      }
      if (fs.existsSync(potentialFromPath)) {
        fromPath = potentialFromPath
      }
    // } else {
    //   fromPath = '_data/Icons/items/5_64_10.png' // Temporary
    }

    const toPath = path.join(`frontend/public/generated-icons/${icon_id}.png`)
    // console.log('i', icon_id, fromPath, toPath, fs.existsSync(fromPath))
    if (icon_id === 20959) {
      console.log('i', icon_id, fromPath, fs.existsSync(fromPath), icons[icon_id].icon_file)
    }
    if (fs.existsSync(fromPath)) {
      fs.copyFileSync(fromPath, toPath)
    }
  })
}
const init = async () => {
  // await downloadAndUnzip('https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip', './_data', 'sde')
  // await downloadAndUnzip('https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Icons.zip', './_data', 'icons_icosn')
  // // await downloadAndUnzip('https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Types.zip', './_data', 'icons_types')

  // await downloadTar('https://data.everef.net/reference-data/reference-data-latest.tar.xz', './_data/reference-data')
  await generateTypeData()
}
init()

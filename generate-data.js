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
import { parse } from 'node-html-parser'

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
  // console.log('marketGroups', Object.keys(marketGroups).length, 'types', Object.keys(types).length)

  // Function to create a recursive structure for a market group
  const createMarketGroupStructure = (marketGroup) => {
    const group = {
      market_group_id: marketGroup.market_group_id,
      name: marketGroup.name.en,
      icon_id: marketGroup.icon_id ? marketGroup.icon_id : 0,
      parent_group_id: marketGroup.parent_group_id || 0
    }

    // console.log('marketGroup', marketGroup)
    if (marketGroup.type_ids && marketGroup.has_types) {
      group.types = marketGroup.type_ids
        .map(type_id => types[type_id])
        .filter(type => type.published)
        .map(type => {
          return { type_id: type.type_id, name: type.name.en, icon_id: type.icon_id, is_type: true, parent_group_id: marketGroup.market_group_id, volume: type.volume }
        })
        .sort((a, b) => b.name.localeCompare(b.name))
    }
    if (marketGroup.child_market_group_ids) {
      group.child_groups = marketGroup.child_market_group_ids.map((childId) =>
        createMarketGroupStructure(marketGroups[childId])
      ).filter(group => (group.types && group.types.length > 0) || (group.child_groups && group.child_groups.length > 0))
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

  // console.log('rootNodes', rootNodes.length)
  if (!fs.existsSync('frontend/public')) fs.mkdirSync('frontend/public')
  if (!fs.existsSync('frontend/public/generated-data')) fs.mkdirSync('frontend/public/generated-data')
  fs.writeFileSync('frontend/public/generated-data/market-types.json', JSON.stringify(rootNodes))

  if (!fs.existsSync('frontend/public/generated-icons')) fs.mkdirSync('frontend/public/generated-icons')
  const uniqueIconIds = findUniqueIconIds({ child_groups: rootNodes })
  const icons = JSON.parse(fs.readFileSync('_data/reference-data/icons.json'))
  // console.log('uniqueIconIds', uniqueIconIds)

  const hoboleaksAssets = fs.readFileSync(path.join('_data', 'hoboleaks-assets.txt'), 'utf-8').split('\n')
  // console.log('hoboleaksAssets', hoboleaksAssets)
  const gameAssetDir = '/Users/Dan.Garfield/Library/Application Support/EVE Online/SharedCache/ResFiles'

  uniqueIconIds.forEach(icon_id => {
    const toPath = path.join(`frontend/public/generated-icons/${icon_id}.png`)
    const resFile = icons[icon_id].icon_file
    const resFileLower = resFile.toLowerCase()
    const potentialLocalFromPath = resFile
      .replace('res:/ui/texture/icons/', '_data/Icons/items/')
      .replace('res:/UI/Texture/Icons/', '_data/Icons/items/')
      .replace('/inventory/', '/Inventory/')
    if (!fs.existsSync(toPath)) {
      if (resFileLower.startsWith('res:/ui/texture/icons/') && fs.existsSync(potentialLocalFromPath)) {
        // console.log('LOCAL YES icon_id', icon_id, resFile, potentialLocalFromPath)
        fs.copyFileSync(potentialLocalFromPath, toPath)
      } else {
        const hoboleaksAssetsFile = hoboleaksAssets.find(a => a.startsWith(resFileLower)).split(',')[1]
        const gameAssetPath = path.join(gameAssetDir, hoboleaksAssetsFile)
        // console.log('icon_id', icon_id, resFile, potentialLocalFromPath, hoboleaksAssetsFile, gameAssetPath)
        fs.copyFileSync(gameAssetPath, toPath)
      }
    } else {
      // console.log('COMPLETE', icon_id, resFile)
    }
  })
}

async function findFiles (directory) {
  const files = []

  async function traverse (currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name)

        if (entry.isDirectory()) {
          await traverse(fullPath)
        } else if (entry.isFile() && entry.name === 'solarsystem.staticdata') {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error('Error reading directory:', currentPath, error)
    }
  }

  await traverse(directory)
  return files
}

const generateSystemListData = async () => {
  const files = await findFiles('_data/sde/fsd/universe/eve')
  const systems = await Promise.all(files.map(async (filePath) => {
    try {
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
      const systemIDLine = lines.find(line => line.includes('solarSystemID'))
      const systemIDMatch = systemIDLine.match(/\d+/)
      const systemID = systemIDMatch ? parseInt(systemIDMatch[0]) : null

      const securityLine = lines.find(line => line.includes('security'))
      const securityMatch = securityLine.match(/-?\d+\.\d+/)
      const security = securityMatch ? parseFloat(securityMatch[0]) : null

      const stargates = lines.filter(line => line.includes('    5')).map(stargateLine => {
        const stargateMatch = stargateLine.match(/\d+/)
        const stargate = stargateMatch ? parseInt(stargateMatch[0]) : null
        return stargate
      })
      const stargateDestinations = lines.filter(line => line.includes('destination')).map(stargateLine => {
        const stargateMatch = stargateLine.match(/\d+/)
        const stargate = stargateMatch ? parseInt(stargateMatch[0]) : null
        return stargate
      })

      const fSplit = filePath.split('/')
      const systemName = fSplit[fSplit.length - 2]

      // console.log(systemName, 'security', security)
      return {
        // path: filePath,
        systemName,
        systemID,
        security,
        stargates,
        stargateDestinations,
        stations: []
      }
    } catch (error) {
      console.error('Error reading file:', filePath, error)
      return null
    }
  }))

  const lines = fs.readFileSync('_data/sde/bsd/staStations.yaml', 'utf-8').split('\n')
  // console.log('lines', lines)
  let systemID = ''
  let stationName = ''
  for (const line of lines) {
    if (line.startsWith('    solarSystemID')) systemID = parseInt(line.replace('    solarSystemID: ', ''))
    if (line.startsWith('    stationName')) {
      stationName = line.replace('    stationName: ', '')
      const system = systems.find(s => s.systemID === systemID)
      if (system) {
        system.stations.push(stationName)
      }
    }
  }
  const connectionsNames = []
  const connections = []
  const connectionsHighSec = []

  systems.forEach(system => {
    system.stargateDestinations.forEach(stargate => {
      const dest = systems.find(s => s.stargates.includes(stargate))
      const edgeName = system.systemName.localeCompare(dest.systemName) < 0 ? [system.systemName, dest.systemName] : [dest.systemName, system.systemName]
      const edge = system.systemID < dest.systemID ? [system.systemID, dest.systemID] : [dest.systemID, system.systemID]
      if (!connections.some(existingEdge => existingEdge[0] === edge[0] && existingEdge[1] === edge[1])) {
        // connectionsNames.push(edgeName)
        connections.push(edge)
      }
      if (system.security >= 0.45 && dest.security >= 0.45) {
        if (!connectionsHighSec.some(existingEdge => existingEdge[0] === edge[0] && existingEdge[1] === edge[1])) {
          connectionsNames.push(edgeName)
          connectionsHighSec.push(edge)
        }
      }
    })
  })

  // console.log('systemID', systemID)
  // console.log('stationName', stationName)
  // console.log('debug', systems.find(s => s.systemID === 30001647))
  // console.log('debug', systems.find(s => s.systemName === 'Mesybier'))
  console.log('debug', systems.find(s => s.systemName === 'Airaken'))
  // 30000185
  console.log('connections', connectionsNames.length, connectionsNames.filter(c => c[0] === 'Hykkota'), connectionsNames.filter(c => c[1] === 'Hykkota'))
  console.log('connections', connections.length, connections.filter(c => c[0] === 30000185), connections.filter(c => c[1] === 30000185))
  console.log('connectionsHighSec', connectionsHighSec.length, connectionsHighSec.filter(c => c[0] === 30000185), connectionsHighSec.filter(c => c[1] === 30000185))
  console.log('systems', systems.length)
  fs.writeFileSync('frontend/public/generated-data/system-stations.json', JSON.stringify({ systems, connections, connectionsHighSec }))
}
const downloadHoboleaksAssetMappings = async () => {
  // Download
  const req = await fetch('https://www.hoboleaks.space/')
  const res = await req.text()
  // console.log('res', res)
  const root = parse(res)
  const links = root.querySelectorAll('a')
  const resfileindexLink = links.find(link => link.textContent === 'resfileindex.txt')
  console.log('hoboleaks-assets', resfileindexLink.getAttribute('href'), resfileindexLink.textContent)
  const reqFile = await fetch(resfileindexLink.getAttribute('href'))
  const resFile = await reqFile.text()
  // console.log('resFile', resFile)
  fs.writeFileSync(path.join('_data', 'hoboleaks-assets.txt'), resFile)
}
const init = async () => {
  // await downloadHoboleaksAssetMappings()
  // await downloadAndUnzip('https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip', './_data', 'sde')
  // await downloadAndUnzip('https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Types.zip', './_data', 'icons_types')
  // await downloadAndUnzip('https://web.ccpgamescdn.com/aws/developers/Uprising_V21.03_Icons.zip', './_data', 'icons_icons')

  // await downloadTar('https://data.everef.net/reference-data/reference-data-latest.tar.xz', './_data/reference-data')
  await generateTypeData()

  // await generateSystemListData()
}
init()

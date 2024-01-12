import DELIVERY_DATA from '../public/generated-delivery-data/delivery-data.json'

export const getDeliveryCharges = (noOfWarps, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral) => {
  // console.log('getDeliveryCharges', noOfWarps, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral)
  const SERVICE_TYPES = { BR: 'Blockade Runner', DST: 'Deep Space Transport', Freighter: 'Freighter', JF: 'Jump Freighter' }

  const getServiceType = (noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral) => {
    if (noOfWarpsNullSec > 0 && volume <= 360000 && collateral <= DELIVERY_DATA.NS_JF_COLLATERAL) return SERVICE_TYPES.JF

    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec > 0 && volume <= 125000 && collateral <= DELIVERY_DATA.LS_BR_COLLATERAL) return SERVICE_TYPES.BR
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec > 0 && volume <= 360000 && collateral <= DELIVERY_DATA.LS_JF_COLLATERAL) return SERVICE_TYPES.JF

    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 12500 && collateral <= DELIVERY_DATA.HS_BR_COLLATERAL) return SERVICE_TYPES.BR
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 62500 && collateral <= DELIVERY_DATA.HS_DST_COLLATERAL) return SERVICE_TYPES.DST
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 1126500 && collateral <= DELIVERY_DATA.HS_FR_COLLATERAL) return SERVICE_TYPES.Freighter
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 360000 && collateral <= DELIVERY_DATA.HS_JF_COLLATERAL) return SERVICE_TYPES.JF
    return null
  }

  const getCharge = (serviceType, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral) => {
    if (serviceType === SERVICE_TYPES.JF) {
      const rush = DELIVERY_DATA.NS_JF_RUSH
      const baseCostHighSec = DELIVERY_DATA.HS_JF_BASE
      const baseCostLowSec = DELIVERY_DATA.LS_JF_BASE
      let collateralCharge = 0
      if (collateral <= 50e9) collateralCharge = 850e6
      if (collateral <= 45e9) collateralCharge = 750e6
      if (collateral <= 40e9) collateralCharge = 650e6
      if (collateral <= 35e9) collateralCharge = 550e6
      if (collateral <= 30e9) collateralCharge = 450e6
      if (collateral <= 25e9) collateralCharge = 350e6
      if (collateral <= 20e9) collateralCharge = 250e6
      if (collateral <= 15e9) collateralCharge = 150e6
      if (collateral <= 10e9) collateralCharge = 50e6

      const highSecWarpCharge = baseCostHighSec
      const lowSecWarpCharge = noOfWarpsLowSec * baseCostLowSec
      const nullSecWarpCharge = noOfWarpsNullSec * baseCostLowSec
      const totalCharge = Math.max(DELIVERY_DATA.MIN_CHARGE, highSecWarpCharge + lowSecWarpCharge + nullSecWarpCharge + collateralCharge)
      // console.log('JF', totalCharge, '-', highSecWarpCharge, lowSecWarpCharge, nullSecWarpCharge, collateralCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    } else if (serviceType === SERVICE_TYPES.BR) {
      const rush = DELIVERY_DATA.HS_BR_RUSH
      const baseCostHighSec = DELIVERY_DATA.HS_BR_WARP
      const baseCostLowSec = DELIVERY_DATA.LS_BR_WARP
      let collateralMultiplier = 1
      let collateralCharge = 0
      if (collateral <= 30e9) collateralMultiplier = 5
      if (collateral <= 4.5e9) collateralMultiplier = 4.5
      if (collateral <= 4e9) collateralMultiplier = 4
      if (collateral <= 3.5e9) collateralMultiplier = 3.5
      if (collateral <= 3e9) collateralMultiplier = 3
      if (collateral <= 2.5e9) collateralMultiplier = 2.5
      if (collateral <= 2e9) collateralMultiplier = 2
      if (collateral <= 1.5e9) collateralMultiplier = 1
      if (collateral > 5e9) {
        collateralCharge = Math.ceil((collateral - 5e9) / 1e9) * 20e6
      }

      const highSecWarpCharge = noOfWarpsHighsec * baseCostHighSec * collateralMultiplier
      const lowSecWarpCharge = noOfWarpsLowSec * baseCostLowSec * collateralMultiplier
      const totalCharge = Math.max(DELIVERY_DATA.MIN_CHARGE, highSecWarpCharge + lowSecWarpCharge + collateralCharge)
      // console.log('BR', totalCharge, '-', collateralMultiplier, collateralCharge, '-', highSecWarpCharge, lowSecWarpCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    } else if (serviceType === SERVICE_TYPES.DST) {
      const rush = DELIVERY_DATA.HS_DST_RUSH
      const baseCostHighSec = DELIVERY_DATA.HS_DST_WARP
      let collateralMultiplier = 1
      let collateralCharge = 0
      if (collateral <= 10e9) collateralMultiplier = 5
      if (collateral <= 4.5e9) collateralMultiplier = 4.5
      if (collateral <= 4e9) collateralMultiplier = 4
      if (collateral <= 3.5e9) collateralMultiplier = 3.5
      if (collateral <= 3e9) collateralMultiplier = 3
      if (collateral <= 2.5e9) collateralMultiplier = 2.5
      if (collateral <= 2e9) collateralMultiplier = 2
      if (collateral <= 1.5e9) collateralMultiplier = 1
      if (collateral > 5e9) {
        collateralCharge = Math.ceil((collateral - 5e9) / 1e9) * 20e6
      }

      const highSecWarpCharge = noOfWarpsHighsec * baseCostHighSec * collateralMultiplier
      const totalCharge = Math.max(DELIVERY_DATA.MIN_CHARGE, highSecWarpCharge + collateralCharge)
      // console.log('DST', totalCharge, '-', collateralMultiplier, collateralCharge, '-', highSecWarpCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    } else if (serviceType === SERVICE_TYPES.Freighter) {
      const rush = DELIVERY_DATA.HS_FR_RUSH
      let baseCostHighSec = DELIVERY_DATA.HS_FR_WARP_1
      if (noOfWarps >= 31) baseCostHighSec = DELIVERY_DATA.HS_FR_WARP_2
      if (volume >= 848000) baseCostHighSec = DELIVERY_DATA.HS_FR_WARP_LARGE
      let collateralMultiplier = 1
      if (collateral <= 3e9) collateralMultiplier = 3
      if (collateral <= 2.5e9) collateralMultiplier = 2.5
      if (collateral <= 2e9) collateralMultiplier = 2
      if (collateral <= 1.5e9) collateralMultiplier = 1

      const highSecWarpCharge = noOfWarpsHighsec * baseCostHighSec * collateralMultiplier
      const totalCharge = Math.max(DELIVERY_DATA.MIN_CHARGE, highSecWarpCharge)
      // console.log('Freighter', totalCharge, '-', collateralMultiplier, '-', highSecWarpCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    }
  }
  const serviceType = getServiceType(noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral)
  // console.log('serviceType', serviceType)
  if (serviceType === null) return { error: 'No service available' }
  const charge = getCharge(serviceType, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral)
  // console.log('charge', charge)
  return charge
}

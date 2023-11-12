export const getDeliveryCharges = (noOfWarps, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral) => {
  console.log('getDeliveryCharges', noOfWarps, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral)

  const SERVICE_TYPES = { BR: 'BR', DST: 'DST', Freighter: 'Freighter', JF: 'JF' }
  const MIN_CHARGE = 4500000

  const getServiceType = (noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral) => {
    if (noOfWarpsNullSec > 0 && volume <= 360000 && collateral <= 50e9) return SERVICE_TYPES.JF

    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec > 0 && volume <= 125000 && collateral <= 5e9) return SERVICE_TYPES.BR
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec > 0 && volume <= 360000 && collateral <= 50e9) return SERVICE_TYPES.JF

    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 12500 && collateral <= 30e9) return SERVICE_TYPES.BR
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 62500 && collateral <= 10e9) return SERVICE_TYPES.DST
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 1126500 && collateral <= 3e9) return SERVICE_TYPES.Freighter
    if (noOfWarpsNullSec === 0 && noOfWarpsLowSec === 0 && volume <= 360000 && collateral <= 50e9) return SERVICE_TYPES.JF
    return null
  }

  const getCharge = (serviceType, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral) => {
    if (serviceType === SERVICE_TYPES.JF) {
      const rush = 200e6
      const baseCostHighSec = 200e6
      const baseCostLowSec = 100e6
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
      const totalCharge = Math.max(MIN_CHARGE, highSecWarpCharge + lowSecWarpCharge + nullSecWarpCharge + collateralCharge)
      console.log('JF', totalCharge, '-', highSecWarpCharge, lowSecWarpCharge, nullSecWarpCharge, collateralCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    } else if (serviceType === SERVICE_TYPES.BR) {
      const rush = 100e6
      const baseCostHighSec = 900000
      const baseCostLowSec = 4e6
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
      const totalCharge = Math.max(MIN_CHARGE, highSecWarpCharge + lowSecWarpCharge + collateralCharge)
      console.log('BR', totalCharge, '-', collateralMultiplier, collateralCharge, '-', highSecWarpCharge, lowSecWarpCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    } else if (serviceType === SERVICE_TYPES.DST) {
      const rush = 100e6
      const baseCostHighSec = 950000
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
      const totalCharge = Math.max(MIN_CHARGE, highSecWarpCharge + collateralCharge)
      console.log('DST', totalCharge, '-', collateralMultiplier, collateralCharge, '-', highSecWarpCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    } else if (serviceType === SERVICE_TYPES.Freighter) {
      const rush = 100e6
      let baseCostHighSec = 1e6
      if (noOfWarps >= 31) baseCostHighSec = 1250000
      if (volume >= 848000) baseCostHighSec = 2000000
      let collateralMultiplier = 1
      if (collateral <= 3e9) collateralMultiplier = 3
      if (collateral <= 2.5e9) collateralMultiplier = 2.5
      if (collateral <= 2e9) collateralMultiplier = 2
      if (collateral <= 1.5e9) collateralMultiplier = 1

      const highSecWarpCharge = noOfWarpsHighsec * baseCostHighSec * collateralMultiplier
      const totalCharge = Math.max(MIN_CHARGE, highSecWarpCharge)
      console.log('Freighter', totalCharge, '-', collateralMultiplier, '-', highSecWarpCharge, rush)
      return { serviceType, charge: totalCharge, rush }
    }
  }
  const serviceType = getServiceType(noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral)
  console.log('serviceType', serviceType)
  if (serviceType === null) return { error: 'No service available' }
  const charge = getCharge(serviceType, noOfWarpsHighsec, noOfWarpsLowSec, noOfWarpsNullSec, volume, collateral)
  console.log('charge', charge)

  return charge
}

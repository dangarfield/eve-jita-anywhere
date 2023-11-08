import { onMount } from 'solid-js'
import { Chart, registerables } from 'chart.js'
import { Scatter } from 'solid-chartjs'
// import zoomPlugin from 'chartjs-plugin-zoom'

const movingAverage = (data, period) => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    const slice = data.slice(Math.max(0, i - period + 1), i + 1)
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length
    result.push(i < 7 ? null : avg)
  }
  return result
}
// const calculateDonchianChannel = (data, period) => {
//   const donchain = []
//   for (let i = period - 1; i < data.length; i++) {
//     const highSlice = data.slice(i - period + 1, i + 1).map(entry => entry[1])
//     const lowSlice = data.slice(i - period + 1, i + 1).map(entry => entry[0])

//     const maxHigh = Math.max(...highSlice)
//     const minLow = Math.min(...lowSlice)
//     donchain.push([minLow, maxHigh])
//   }
//   return donchain
// }

const TypeDetailsHistory = (props) => {
  onMount(() => {
    Chart.register(...registerables)
  })
  const dates = props.history().map(h => h.date)
  const medianDayPrice = props.history().map(h => h.average)
  const volume = props.history().map(h => h.volume)
  const dayPriceMA7 = movingAverage(medianDayPrice, 7)
  const dayPriceMA20 = movingAverage(medianDayPrice, 20)

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Median Day Price',
        data: medianDayPrice,
        backgroundColor: 'rgba(255, 191, 0, 0.5)',
        borderColor: 'rgba(255, 191, 0, 0.5)',
        borderWidth: 0,
        pointRadius: 1,
        type: 'line',
        yAxisID: 'yAxisPrice'
      },
      {
        label: 'Price 7 MA',
        data: dayPriceMA7,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        type: 'line',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'yAxisPrice'
      },
      {
        label: 'Price 20 MA',
        data: dayPriceMA20,
        borderColor: 'rgba(255, 191, 0, 1)',
        borderWidth: 1,
        type: 'line',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'yAxisPrice'
      },
      // {
      //   label: 'Min / Max Price',
      //   data: priceDataMinMax,
      //   backgroundColor: 'rgba(60, 60, 60, 1)',
      //   borderColor: 'rgba(60, 60, 60, 1)',
      //   borderWidth: 0,
      //   type: 'bar',
      //   yAxisID: 'yAxisPrice',
      //   hidden: true
      // },
      // {
      //   label: 'Donchain',
      //   data: donchain,
      //   backgroundColor: 'rgba(30, 30, 30, 0.5)',
      //   borderColor: 'rgba(30, 30, 30, 0.5)',
      //   borderWidth: 0,
      //   type: 'bar',
      //   yAxisID: 'yAxisPrice',
      //   hidden: true
      // },
      {
        label: 'Volume',
        data: volume,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 0.7)',
        type: 'bar',
        yAxisID: 'yAxisVolume',
        barPercentage: 1,
        barThickness: 3
      }
    ]

  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        pan: { enabled: true },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'y',
          scaleMode: 'x'
        },
        drag: {
          enabled: true
        },
        //   pan: {
        //     enabled: true,
        //     mode: 'xy'
        //   },
        limits: {
          yAxisPrice: { min: Math.min(...medianDayPrice), max: Math.max(...medianDayPrice) },
          yAxisVolume: { min: 0, max: Math.max(...volume) * 4 }
        }
      }
    },
    scales: {
      yAxisPrice: {
        type: 'linear',
        position: 'left',
        beginAtZero: false
      },
      yAxisVolume: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        min: 0,
        max: Math.max(...volume) * 4,
        barPercentage: 1,
        grid: {
          display: false
        }
      }
    }
  }
  return (
    <>
      {/* <p>TypeDetailsHistory - {props.selectedType().name}</p> */}
      <div>
        {/* <Line data={chartData} options={chartOptions} /> */}
        <Scatter data={chartData} options={chartOptions} />
      </div>
      {/* <p class='text-info'>{props.history()}</p> */}
    </>
  )
}
export default TypeDetailsHistory

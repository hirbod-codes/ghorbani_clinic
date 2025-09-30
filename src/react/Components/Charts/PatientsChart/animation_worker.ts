import { Bezier } from "bezier-js"
import { LineChart } from "../../Chart/LineChart"

self.addEventListener('message', (e) => {
    self.postMessage(performIntensiveTask(e.data))
})

function performIntensiveTask(data) {
    let { drawPoints, lineWidth } = JSON.parse(data)

    // the Bezier class name will change when used in below line, in compiled code, in worker, therefor the `const Bezier = require('bezier-js').Bezier` statement at the top of the blob wouldn't work!
    return JSON.stringify(LineChart.calculateControlPoints(drawPoints).map(c => new Bezier(...c).offset((lineWidth ?? 0) / 2) as Bezier[]))
}
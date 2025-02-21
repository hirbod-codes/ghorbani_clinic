// import { Bezier } from "bezier-js/dist/bezier.js"
// import { LineChart } from "./LineChart"

// import { Bezier } from "@/node_modules/bezier-js"
// const Bezier = require("bezier-js")
// importScripts('./../../../../node_modules/bezier-js/dist/bezier.cjs', './../../../../node_modules/bezier-js/dist/bezier.js')
// importScripts('./../../../../node_modules/bezier-js/dist/bezier.js')
// importScripts('@/node_modules/bezier-js/dist/bezier.js')
// importScripts("https://unpkg.com/bezier-js/dist/bezier.js")


function calculateControlPoints(dataPoints, loopCallback?: any) {
    let points: any = []
    for (let i = 0; i <= dataPoints.length - 2; i++) {
        let p = dataPoints[i]
        let np = dataPoints[i + 1]
        let cp1 = { x: p.x + ((np.x - p.x) / 2), y: p.y }
        let cp2 = { x: np.x - ((np.x - p.x) / 2), y: np.y }

        points.push([p, cp1, cp2, np])

        if (loopCallback)
            loopCallback([p, cp1, cp2, np], i)
    }

    return points
}

(() => {
    self.addEventListener('message', (e) => {
        self.postMessage(performIntensiveTask(e.data))
    })

    function performIntensiveTask(data) {
        let { drawPoints, lineWidth } = JSON.parse(data)

        console.log({ drawPoints, lineWidth })

        return 'giiiiiiiiiiiiiiiiiiiii'

        // return JSON.stringify(calculateControlPoints(drawPoints).map(c => new Bezier(...c).offset((lineWidth ?? 0) / 2)))
    }
})()


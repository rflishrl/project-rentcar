// inisiasi library
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

// routes
const mobilRoutes = require("./routes/mobil")
const pelangganRoutes = require("./routes/pelanggan")
const karyawanRoutes = require("./routes/karyawan")
const sewaRoutes = require("./routes/sewa")

// implementation
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use("/mobil", mobilRoutes)
app.use("/pelanggan", pelangganRoutes)
app.use("/karyawan", karyawanRoutes)
app.use("/sewa", sewaRoutes)

//port
app.listen(3000, () => {
    console.log("Run on port 3000")
})
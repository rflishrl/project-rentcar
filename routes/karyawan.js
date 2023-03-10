const express = require("express")
const mysql = require("mysql")
const md5 = require('md5')

const app = express()

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "penyewaan_mobil"
})

db.connect(error => {
    if (error) {
        console.log(error.message)
    } else {
        console.log("MySQL Connected")
    }
})

validateToken = () => {
    return (req, res, next) => {
        // cek keberadaan "Token" pada request header
        if (!req.get("Token")) {
            // jika "Token" tidak ada
            res.json({
                message: "Access Forbidden"
            })
        } else {
            // tampung nilai Token
            let token  = req.get("Token")
            
            // decrypt token menjadi id_karyawan
            let decryptToken = crypt.decrypt(token)

            // sql cek id_karyawan
            let sql = "select * from karyawan where ?"

            // set parameter
            let param = { id_karyawan: decryptToken}

            // run query
            db.query(sql, param, (error, result) => {
                if (error) throw error
                 // cek keberadaan id_karyawan
                if (result.length > 0) {
                    // id_karyawan tersedia
                    next()
                } else {
                    // jika karyawan tidak tersedia
                    res.json({
                        message: "Invalid Token"
                    })
                }
            })
        }

    }
}

//=========================== KARYAWAN ===========================
// endpoint login karyawan (authentication)
app.post("//auth", (req, res) => {
    // tampung username dan password
    let param = [
        req.body.username, //username
        md5(req.body.password) // password
    ]
    

    // create sql query
    let sql = "select * from karyawan where username = ? and password = ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // cek jumlah data hasil query
        if (result.length > 0) {
            // karyawan tersedia
            res.json({
                message: "Logged",
                token: crypt.encrypt(result[0].id_karyawan), // generate token
                data: result
            })
        } else {
            // karyawan tidak tersedia
            res.json({
                message: "Invalid username/password"
            })
        }
    })
})

// end-point menyimpan data karyawan
app.post("/", validateToken(), (req,res) => {

    // prepare data
    let data = {
        nama_karyawan: req.body.nama_karyawan,
        alamat_karyawan: req.body.alamat_karyawan,
        kontak: req.body.kontak,
        username: req.body.username,
        password: md5(req.body.password)
    }

    // create sql query insert
    let sql = "insert into karyawan set ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " Data Berhasil Ditambahkan"
            }
        }
        res.json(response) // send response
    })
})

// end-point akses data karyawan
app.get("/", validateToken(), (req, res) => {
    // create sql query
    let sql = "select * from karyawan"

    // run query
    db.query(sql, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }            
        } else {
            response = {
                count: result.length, // jumlah data
                karyawan: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point akses data karyawan berdasarkan id_karyawan tertentu
app.get("/:id", validateToken(), (req, res) => {
    let data = {
        id_karyawan: req.params.id
    }
    // create sql query
    let sql = "select * from karyawan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message // pesan error
            }            
        } else {
            response = {
                count: result.length, // jumlah data
                karyawan: result // isi data
            }            
        }
        res.json(response) // send response
    })
})


// end-point mengubah data karyawan
app.put("/", validateToken(), (req,res) => {

    // prepare data
    let data = [
        // data
        {
            nama_karyawan: req.body.nama_karyawan,
            alamat_karyawan: req.body.alamat_karyawan,
            kontak: req.body.kontak,
            username: req.body.username,
            password: md5(req.body.password)
        },

        // parameter (primary key)
        {
            id_karyawan: req.body.id_karyawan
        }
    ]

    // create sql query update
    let sql = "update karyawan set ? where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " Data Berhasil Dirubah"
            }
        }
        res.json(response) // send response
    })
})

// end-point menghapus data karyawan berdasarkan id_karyawan
app.delete("/:id", validateToken(), (req,res) => {
    // prepare data
    let data = {
        id_karyawan: req.params.id
    }

    // create query sql delete
    let sql = "delete from karyawan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " Data Berhasil Dihapus"
            }
        }
        res.json(response) // send response
    })
})

module.exports = app
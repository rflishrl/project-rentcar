const express = require("express")
const mysql = require("mysql")
const Cryptr = require("cryptr")
const crypt = new Cryptr("140533601726")

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

//=========================== PELANGGAN ===========================

// end-point menyimpan data pelanggan
app.post("/", validateToken(), (req,res) => {

    // prepare data
    let data = {
        nama_pelanggan: req.body.nama_pelanggan,
        alamat_pelanggan: req.body.alamat_pelanggan,
        kontak: req.body.kontak
    }

    // create sql query insert
    let sql = "insert into pelanggan set ?"

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

// end-point akses data pelanggan
app.get("/", validateToken(), (req, res) => {
    // create sql query
    let sql = "select * from pelanggan"

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
                pelanggan: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point akses data pelanggan berdasarkan id_pelanggan tertentu
app.get("/:id", validateToken(), (req, res) => {
    let data = {
        id_pelanggan: req.params.id
    }
    // create sql query
    let sql = "select * from pelanggan where ?"

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
                pelanggan: result // isi data
            }            
        }
        res.json(response) // send response
    })
})

// end-point mengubah data pelanggan
app.put("/", validateToken(), (req,res) => {

    // prepare data
    let data = [
        // data
        {
            nama_pelanggan: req.body.nama_pelanggan,
            alamat_pelanggan: req.body.alamat_pelanggan,
            kontak: req.body.kontak
        },

        // parameter (primary key)
        {
            id_pelanggan: req.body.id_pelanggan
        }
    ]

    // create sql query update
    let sql = "update pelanggan set ? where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " Data berhasil diubah"
            }
        }
        res.json(response) // send response
    })
})

// end-point menghapus data pelanggan berdasarkan id_pelanggan
app.delete("/:id", validateToken(), (req,res) => {
    // prepare data
    let data = {
        id_pelanggan: req.params.id
    }

    // create query sql delete
    let sql = "delete from pelanggan where ?"

    // run query
    db.query(sql, data, (error, result) => {
        let response = null
        if (error) {
            response = {
                message: error.message
            }
        } else {
            response = {
                message: result.affectedRows + " Data berhasil dihapus"
            }
        }
        res.json(response) // send response
    })
})

module.exports = app
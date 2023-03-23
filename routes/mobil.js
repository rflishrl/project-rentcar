const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static(__dirname));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "penyewaan_mobil",
});

db.connect((error) => {
  if (error) {
    console.log(error.message);
  } else {
    console.log("MySQL Connected");
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // set file storage
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    // generate file name
    cb(null, "image-" + Date.now() + path.extname(file.originalname));
  },
});

let upload = multer({ storage: storage });

//=========================== MOBIL ===========================
// end-point menyimpan data mobil

app.post("/", upload.single("image"), (req, res) => {
  // prepare data
  let data = {
    id_mobil: req.body.id_mobil,
    nomor_mobil: req.body.nomor_mobil,
    merk: req.body.merk,
    jenis: req.body.jenis,
    warna: req.body.warna,
    tahun_pembuatan: req.body.tahun_pembuatan,
    biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
    image: req.file.filename,
  };

  if (!req.file) {
    // jika tidak ada file yang diupload
    res.json({
      message: "Tidak ada file yang dikirim",
    });
  } else {
    // create sql insert
    let sql = "insert into mobil set ?";

    // run query
    db.query(sql, data, (error, result) => {
      if (error) throw error;
      res.json({
        message: result.affectedRows + " data berhasil disimpan",
      });
    });
  }
});

// end-point akses data mobil
app.get("/", (req, res) => {
  // create sql query
  let sql = "select * from mobil";

  // run query
  db.query(sql, (error, result) => {
    let response = null;
    if (error) {
      response = {
        message: error.message, // pesan error
      };
    } else {
      response = {
        count: result.length, // jumlah data
        mobil: result, // isi data
      };
    }
    res.json(response); // send response
  });
});

// end-point akses data mobil berdasarkan id_mobil tertentu
app.get("/:id", (req, res) => {
  let data = {
    id_mobil: req.params.id,
  };
  // create sql query
  let sql = "select * from mobil where ?";

  // run query
  db.query(sql, data, (error, result) => {
    let response = null;
    if (error) {
      response = {
        message: error.message, // pesan error
      };
    } else {
      response = {
        count: result.length, // jumlah data
        mobil: result, // isi data
      };
    }
    res.json(response); // send response
  });
});

// end-point mengubah data mobil

app.put("/", upload.single("image"), (req, res) => {
  let data = null,
    sql = null;
  // paramter perubahan data
  let param = { id_mobil: req.body.id_mobil };

  if (!req.file) {
    // jika tidak ada file yang dikirim = update data saja
    data = {
      nomor_mobil: req.body.nomor_mobil,
      merk: req.body.merk,
      jenis: req.body.jenis,
      warna: req.body.warna,
      tahun_pembuatan: req.body.tahun_pembuatan,
      biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
    };
  } else {
    // jika mengirim file = update data + reupload
    data = {
      nomor_mobil: req.body.nomor_mobil,
      merk: req.body.merk,
      jenis: req.body.jenis,
      warna: req.body.warna,
      tahun_pembuatan: req.body.tahun_pembuatan,
      biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
      image: req.body.image,
    };

    // get data yg akan diupdate utk mendapatkan nama file yang lama
    sql = "select * from mobil where ?";
    // run query
    db.query(sql, param, (err, result) => {
      if (err) throw err;
      // tampung nama file yang lama
      let fileName = result[0].image;

      // hapus file yg lama
      let dir = path.join(__dirname, "image", fileName);
      fs.unlink(dir, (error) => {});
    });
  }

  // create sql update
  sql = "update mobil set ? where ?";

  // run sql update
  db.query(sql, [data, param], (error, result) => {
    if (error) {
      res.json({
        message: error.message,
      });
    } else {
      res.json({
        message: result.affectedRows + " data berhasil diubah",
      });
    }
  });
});

// end-point menghapus data mobil berdasarkan id_mobil
app.delete("/:id", (req, res) => {
  // prepare data
  let data = {
    id_mobil: req.params.id,
  };

  // create query sql delete
  let sql = "delete from mobil where ?";

  // run query
  db.query(sql, data, (error, result) => {
    let response = null;
    if (error) {
      response = {
        message: error.message,
      };
    } else {
      response = {
        message: result.affectedRows + " data berhasil dihapus",
      };
    }
    res.json(response); // send response
  });
});

module.exports = app;

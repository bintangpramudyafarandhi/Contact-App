const express = require('express')
const expressEjsLayouts = require('express-ejs-layouts')
const app = express()
const port = 3000
const path = require('path')
const morgan = require('morgan')
const fs = require('fs')
const { title } = require('process')
const bodyParser = require('body-parser')
const { check, body, validationResult} = require('express-validator')
const { log } = require('console')


app.set('view engine','ejs')//menggunakan ejs
app.use(expressEjsLayouts)//menggunakan expressEjsLayouts
app.use(morgan('dev'))//menggunakan morgan
app.use(express.urlencoded({extended:false}))//menggunakan express.urlencoded


// membuat folder data jika belum ada
const dirPath = './data';
if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath);
}

// membuat file contacts.json jika belum ada
const dataPath = './data/contacts.json';
if(!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath,'[]','utf-8')
}

// fungsi untuk membaca data di dalam json
const readJSON = () => {
  const file = fs.readFileSync('data/contacts.json', 'utf-8')
  const contacts = JSON.parse(file)
  return contacts;
}

// mencari data berdasarkan nama
const detail = (name) => {
  const contacts = readJSON();
  const detcon = contacts.find((data) => data.name === name)
  return detcon
}

// fungsi untuk menyimpan data ke dalam json
const savedata = (name, email, mobile) => {
  const contacts = readJSON();
  const contact = {name, email, mobile}
  contacts.push(contact);
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts))
}

// mencari nama yang duplikat
const duplicate = (name) => {
  const contacts = readJSON()
  const duplikat = contacts.find((data) => data.name == name)
  return duplikat
}

// mencari data berdasarkan nama
const findContact = (name) => {
  const cont = readJSON()
  const contact = cont.find((contact) => contact.name === name)
  return contact
}

// menghapus data
const delet = (name) => {
  const contacts = readJSON();
  const fil = contacts.filter((contact) => contact.name !== name)
  fs.writeFileSync('data/contacts.json',JSON.stringify(fil));
}

// mengupdate data
const update = (name, email, mobile, update) => {
  const contacts = readJSON();
  const updt = contacts.find((data) => {
    return data.name == update
  });
  updt.name = name
  updt.email = email
  updt.mobile = mobile

  console.log(updt);

  fs.writeFileSync("data/contacts.json", JSON.stringify(contacts))
}

// menampilkan waktu
app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

// menampilkan halaman index
app.get('/', (req,res) => {
  res.render('index', {
    nama : "Bintang Pramudya Farandhi",
    layout: 'template/main',
    title: "Home"
  }) 
})

// membuat file static menjadi public
app.use(express.static(path.join(__dirname,'public')))


// menampilkan halaman about
app.get('/about', (req,res) => {
  res.render('about', {
    layout: 'template/main',
    title: 'About'
  })
})

// menampilkan halaman add
app.get('/add', (req,res) => {
  res.render('add', {
    layout: 'template/main',
    title: 'Add New Contact'
  })
})

//menampilkan halaman contact
app.get('/contact', (req,res) => {
  const cont = readJSON()
  console.log(cont);
  // cont =[
  //   {
  //     name: 'bintang',
  //     email: 'bintang@gmail.com',
  //   },
  //   {
  //     name: 'desman',
  //     email: 'desman@gmail.com',
  //   },
  //   {
  //     name: 'gio',
  //     email: 'gio@gmail.com'
  //   }
  // ]
  res.render('contact', {
    cont,
    layout: 'template/main',
    title: "Contact"
  })
})


// menampilkan halaman detail
app.get('/contact/:id', (req, res) => {
  const getDetail = detail(req.params.id)
  res.render('detail', {
    title: "Contact Detail",
    layout: 'template/main',
    getDetail,

  })
})

// menampilkan halaman product
app.get('/product', (req,res) => {
    res.send("Product id : " + req.query.id + '<br><br>' + "Category id : " + req.query.idcat)
})

// mendapatkan data dari page add data
app.post('/added', [
  // validator data nama duplikat
  check('name').custom(value => {
    const duplikat = duplicate(value)
    if(duplikat) {
      throw new Error('Name already taken!')
    }
    return true
  }),
  // validator nama menggunakan isAlpha
  check('name', 'Your name is invalid').isAlpha("en-US", {ignore: " "}),
  // validator email menggunakan isEmail
  check('email', 'Your email is invalid!').not().isEmpty().isEmail(),
  // validator no.hp menggunakan isMobilephone
  check('mobile', 'Your phone number is invalid!').not().isEmpty().isMobilePhone('id-ID')
  ], 
  function (req,res) {
  // menangkap hasil validasi jika error
  const errors = validationResult(req);

    // jika ada error
    if (!errors.isEmpty()) {
      res.render("add", {
        layout: "template/main",
        title: "Add New Contact",
        errors: errors.array()
      })
    } else { // jika tidak ada error
      savedata(req.body.name, req.body.email, req.body.mobile)
      res.redirect("contact")
    }
})

// mendelete data
app.post('/delete/:name', (req, res) => {
  const cont = findContact(req.params.name)
  if (!cont) { // jika data tidak ditemukan
    res.status(404)
    res.send('gagal dihapus')
  } else { // jika data ditemukan
    delet(req.params.name)// delete data
    res.redirect("/contact")// kembali ke halaman contact
  }
})


// menampilkan halaman edit data
app.get("/edit/:name", (req,res) => {
  const getDetail = detail(req.params.name)
  const params = req.params.name
  res.render("edit", {
    params,
    getDetail,
    layout: "template/main",
    title: "Edit Contact",
  })
})

// memasukkan data yang sudah di edit
app.post("/edit/:name", [
  // cek nama duplikat
  body('name').custom((value, {req}) => {
    const duplikat = duplicate(value)
    if(value != req.params.name && duplikat) {
      throw new Error('Name already taken!')
    }
    return true
  }),
  
  // validator nama dengan isAlpha
  check('name', 'Your name is invalid').isAlpha("en-US", {ignore: " "}),
  // validator email dengan isEmail
  check('email', 'Your email is invalid!').not().isEmpty().isEmail(),
  // validator no.hp dengan isMobilePhone
  check('mobile', 'Your phone number is invalid!').not().isEmpty().isMobilePhone('id-ID')
  ],
  
  (req, res) => {
    // menangkap hasil validasi
    const errors = validationResult(req);
    const getDetail = req.body

    if (!errors.isEmpty()) {// jika ada error
      const params = req.params.name
      res.render("edit", {
        errors: errors.array(),
        layout: "template/main",
        title: "Edit Contact",
        params,
        getDetail
      })
      console.log(errors.array());
    } else { // jika tidak ada error
      update(req.body.name, req.body.email, req.body.mobile, req.params.name)
      res.redirect("/contact") // redirect ke halaman contact
    }
  }
  )

//menampilkan error 404
app.use('/',(req,res) => {
    res.status(404)
    res.send('Page not found : 404')
})

// membaca port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
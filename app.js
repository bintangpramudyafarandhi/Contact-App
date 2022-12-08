const express = require('express')
const expressEjsLayouts = require('express-ejs-layouts')
const app = express()
const port = 3000
const path = require('path')
const morgan = require('morgan')
const fs = require('fs')
const { title } = require('process')
const bodyParser = require('body-parser')

//menggunakan ejs
app.set('view engine','ejs')
app.use(expressEjsLayouts)
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


const dirPath = './data';
if(!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath);
}

const dataPath = './data/contacts.json';
if(!fs.existsSync(dataPath)){
    fs.writeFileSync(dataPath,'[]','utf-8')
}
const readJSON = () => {
  const file = fs.readFileSync('data/contacts.json', 'utf-8')
  const contacts = JSON.parse(file)
  return contacts;
}

const detail = (name) => {
  const contacts = readJSON();
  const detcon = contacts.find((data) => data.name === name)
  return detcon
}

const savedata = (data) => {
  const contacts = readJSON();
  contacts.push(data);
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts))
}

app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})


app.get('/', (req,res) => {
  res.render('index', {
    nama : "Bintang Pramudya Farandhi",
    layout: 'template/main',
    title: "Home"
  }) 
})

app.use(express.static(path.join(__dirname,'public')))

app.get('/about', (req,res) => {
  res.render('about', {
    layout: 'template/main',
    title: 'About'
  })
})

app.get('/add', (req,res) => {
  res.render('add', {
    layout: 'template/main',
    title: 'Add'
  })
})

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

app.get('/contact/:id', (req, res) => {
  const getDetail = detail(req.params.id)
  res.render('detail', {
    title: "Contact Detail",
    layout: 'template/main',
    getDetail,

  })
})

app.get('/product', (req,res) => {
    res.send("Product id : " + req.query.id + '<br><br>' + "Category id : " + req.query.idcat)
})

app.post('/added', (req,res) => {
  const add = {name : req.body.name, email : req.body.email, mobile : req.body.phone}
  savedata(add)
  res.redirect("contact")
})

//error 404
app.use('/',(req,res) => {
    res.status(404)
    res.send('Page not found : 404')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
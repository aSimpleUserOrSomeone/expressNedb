const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const Datastore = require('nedb')

const app = express()
const port = 5500

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {
        when: (operand_1, operator, operand_2, options) => {
            var operators = {
                'eq': function (l, r) { return l == r; },
                'neq': function (l, r) { return l != r; },
                'gt': function (l, r) { return Number(l) > Number(r); },
                'or': function (l, r) { return l || r; },
                'and': function (l, r) { return l && r; },
                '%': function (l, r) { return (l % r) === 0; }
            }
                , result = operators[operator](operand_1, operand_2);

            if (result) return options.fn(this);
            else return options.inverse(this);
        }
    }
}));

app.use(express.urlencoded({ extended: true }))
app.use(express.static('static'))


const cars = new Datastore({
    filename: 'kolekcja.db',
    autoload: true
})

app.get("/", (req, res) => {
    res.render('index.hbs', { ia: true })
})
app.get("/add", (req, res) => {
    res.render('add.hbs', { aa: true })
})

app.post('/add', (req, res) => {
    const data = {
        ubezpieczony: req.body.ubez != undefined ? "TAK" : "NIE",
        benzyna: req.body.benz != undefined ? "TAK" : "NIE",
        uszkodzony: req.body.uczk != undefined ? "TAK" : "NIE",
        naped: req.body.nape != undefined ? "TAK" : "NIE",
    }

    cars.insert(data, (err, newDoc) => {
        res.render('add.hbs', { aa: true, id: newDoc._id })
    })

})

app.get("/edit", (req, res) => {
    cars.find({}, (err, docs) => {
        docs.forEach((e, i) => {
            e.is_edit_id = req.query._id === e._id ? true : false
        })
        res.render('edit.hbs', { ea: true, docs: docs, edit_id: req.query._id })
    })
})

app.post("/edit", (req, res) => {
    if (req.body.ubez == "TAK") { var ubez = "TAK" }
    else if (req.body.ubez == "NIE") { var ubez = "NIE" }
    else { var ubez = "BRAK" }

    if (req.body.benz == "TAK") { var benz = "TAK" }
    else if (req.body.benz == "NIE") { var benz = "NIE" }
    else { var benz = "BRAK" }

    if (req.body.uszk == "TAK") { var uszk = "TAK" }
    else if (req.body.uszk == "NIE") { var uszk = "NIE" }
    else { var uszk = "BRAK" }

    if (req.body.nape == "TAK") { var nape = "TAK" }
    else if (req.body.nape == "NIE") { var nape = "NIE" }
    else { var nape = "BRAK" }

    cars.update({ _id: req.body._id }, {
        ubezpieczony: ubez,
        benzyna: benz,
        uszkodzony: uszk,
        naped: nape
    }, {}, (err, numReplaced) => {
        cars.find({}, (err, docs) => {
            res.render('edit.hbs', { ea: true, docs: docs })
        })
    })
})

app.post("/list", (req, res) => {
    console.log(req.body)
    // cars.update({}, (err, docs) => {

    // })
})

app.get("/list", (req, res) => {
    cars.find({}, (err, docs) => {
        docs.forEach((e, i) => e.tmp = 'temporary')
        res.render('list.hbs', { la: true, docs: docs })
    })
})

app.get('/list&id=:id', (req, res) => {
    const id = req.params.id
    cars.remove({ _id: id }, {}, (err, docRemoved) => {
        cars.find({}, (err, docs) => {
            docs.forEach((e, i) => e.tmp = 'temporary')
            res.render('list.hbs', { la: true, docs: docs })
        })
    })
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})
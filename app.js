// ES6 format 

const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();


// Map global promise - get rid of warning 
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/mydashboard', {
  useNewUrlParser: true 
})
  .then(() => console.log ('MongoDB Connected')) // Promise
  .catch(err => console.log(err)); // Error in mongoDB connection

// Load Idea Model 
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Method override middleware with POST having ?_method=DELETE
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  
}))

app.use(flash());

//Global variables
app.use(function(req,res, next){
  res.locals.sucess_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('er');
});


//Middleware 
//app.use(function(req,res, next){
  // console.log(Date.now());
  //req.name = "Pawan Mali"
  //next();
//});


// Index Route 
app.get('/',(req,res)=> {
  //  console.log(req.name);
  const title = 'Welcome to our Page ';
    res.render('index', {
      title : title
    });
});


// About Route
app.get('/about', (req,res) => {
  //res.send('ABOUT');
  res.render('about')
});

// Idea Index Page
app.get('/ideas', (req,res)=> {
  Idea.find({})
  .sort({date: 'desc'})  
  .then(ideas => {
      res.render('ideas/index', {
        ideas : ideas 
      });
    });
 });


// Add Idea Form 
app.get('/ideas/add', (req,res)=> {
  res.render('ideas/add');
});


// Edit Idea Form 
app.get('/ideas/edit/:id', (req,res)=> {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea=> {
    res.render('ideas/edit', {
      idea:idea
    });
  });
  
});

//Process Form 
app.post('/ideas',(req,res)=> {
  let errors = [];

  if (!req.body.title){
    errors.push({text: 'Please add a title'});
      }
  
  if(errors.length > 0 ){
    res.render('ideas/add', {
      errors : errors, 
      title : req.body.title,
      details: req.body.details
    });
  } else {
  //  res.send('passed');
  const newUser = {
    title : req.body.title,
    details : req.body.details
  }  
  new Idea(newUser)
  .save()
  .then(idea=> {
    req.flash('success_msg', ' Idea added ');
    res.redirect('/ideas');
  }) 
  }

});

//  console.log(req.body);
//  res.send('ok');


// Edit Form process 
app.put('/ideas/:id',(req,res)=> {
  Idea.findOne({
    _id:req.params.id
  })
  .then(idea=> {
    // new values 
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save()
    .then(idea => {
      req.flash('success_msg', ' Idea added ');
        res.redirect('/ideas');
    })
  });
});


// Delete Idea 

app.delete('/ideas/:id', (req,res)=> {
 // res.send('DELETE');
 Idea.remove({_id:req.params.id})
 .then(()=> {
   req.flash('success_msg', ' Idea removed ');
   res.redirect('/ideas');
 });
});

const port = 5000; 

app.listen(port,()=> {
 // console.log(` Server started on port ${port}`);
   console.log('Server started on port '+ port); }); 
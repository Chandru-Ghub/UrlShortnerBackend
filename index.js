const express = require('express');
const app = express();
const shortID = require('shortid')
const mongoose = require('mongoose');
const dotenv = require('dotenv').config()
const PORT  = 3200;
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())

// app.get('/dd',(req,res)=>{

//     res.send(" I'm Working")
// })

//connect mongoDB
mongoose.connect(process.env.DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(res=>console.log('DB connected'))
.catch(err=>console.log(err))



//User schema

const ShortURLSchema = new mongoose.Schema({

    shortCode: {
        type:String,
        required:true,
        default:shortID.generate,

    },
    longURL:{
        type:String,
        required:true,
    }
})


// Define the ShortURL model
const ShortURL = mongoose.model('ShortURL', ShortURLSchema);

// API route to create a short URL
app.post('/shorturl', async (req, res) => {
  const { url } = req.body;

  try {
    const newURL = new ShortURL({
      longURL: url,
    });

    await newURL.save();
    
    res.json({ shortURL: `http://localhost:3200/${newURL.shortCode}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API route to redirect to original URL
app.get('/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;

  try {
    const url = await ShortURL.findOne({ shortCode });

    if (url) {
      res.redirect(url.longURL);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT,()=>{
    console.log('server running in port ',PORT);
})
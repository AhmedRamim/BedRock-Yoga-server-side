const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.by8imti.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();






    const usersCollection = client.db('bedRockYogaDB').collection('users')
    const allClassesCollection = client.db('bedRockYogaDB').collection('allClasses')
    const selectedClass = client.db('bedRockYogaDB').collection('selectedClass')

    // classes apis
    app.get('/alldata',async(req,res) => {
      const result = await allClassesCollection.find().toArray()
      res.send(result)
    })

    app.get('/allclasses/:email', async (req, res) => {
      const email = req.params.email;
      const filter = {instructorEmail: email}
      const result = await allClassesCollection.find(filter).toArray();
      res.send(result)
    })
    app.get('/status', async (req, res) => {
      const filter = {status: 'approved'}
      const result = await allClassesCollection.find(filter).toArray();
      res.send(result)
    })

    // get specific user for role
    app.get('/user/:email',async(req,res) => {
      const email = req.params.email;
      const filter = {email : email}
      const result = await usersCollection.findOne(filter)
      res.send(result)
    })

    // get all instructor 
    
    
    app.put('/updateclass/:id',async(req,res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = {_id : new ObjectId(id)}
      const options = {upsert: true}
      const updateDoc = {
        $set: {
          className: user.className,
          classImage: user.classImage,
          availableSeats: user.availableSeats,
          price: user.price
        }
      }
      const result = await allClassesCollection.updateOne(filter,updateDoc,options)
      res.send(result)
    })

    // manage user api

    app.get('/users',async(req,res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    // get all instructor
    app.get('/instructors',async(req,res) => {
      const result = await usersCollection.find({role : 'instructor'}).toArray()
      res.send(result)

    })
    app.post('/addclass', async (req, res) => {
      const allClass = req.body;
      const result = await allClassesCollection.insertOne(allClass);
      res.send(result)
    })

    // save user 
    app.put("/users/:email", async (req, res) => {
      // console.log('consoled');
      const email = req.params.email;
      const user = req.body;
      const query = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(query, updateDoc, options)
      console.log(result);
      res.send(result)
    })



    // updated approved status
    app.put('/allclasses/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set:status
      }
      const result = await allClassesCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    // selected class for student
    app.get('/getselectedclass/:email',async(req,res) => {
      const email = req.params.email;
      const result = await selectedClass.find({instructorEmail:email}).toArray()
      res.send(result)
    })
    app.post('/selectedclass',async(req,res)=> {
      const body = req.body
      const result = await selectedClass.insertOne(body)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
















app.get('/', (req, res) => {
  res.send('BedRock Yoga is Running')
})

app.listen(port, () => {
  console.log(`BedRock Yoga is running on port : ${port}`);
})



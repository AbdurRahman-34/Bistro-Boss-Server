const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// Middleware use
app.use(cors()) 
app.use(express.json())


// Mongodb coonection code ::::::
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pl7tiry.mongodb.net/?retryWrites=true&w=majority`;

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

    const usersCollection = client.db("bistroDb").collection("users");
    const menuCollection = client.db("bistroDb").collection("menu");
    const reviewCollection = client.db("bistroDb").collection("reviews");
    const cartCollection = client.db("bistroDb").collection("carts");


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token =  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({token})
    })





    // Users Api:::::::::
    app.post('/users', async(req, res) => {
      const user = req.body;
      // google login filter
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({message: 'user already existing'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    // User Api get :::::
    app.get('/users', async(req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result)
    })

    // Admin create :::::
    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })






    // Menu Api::::::::::
    app.get('/menu', async(req, res)=>{
        const result = await menuCollection.find().toArray();
        res.send(result)
    })

    // Review Api :::::::::
    app.get('/reviews', async(req, res)=>{
        const result = await reviewCollection.find().toArray();
        res.send(result)
    })


    // Cart Collection apis :::
    app.get('/carts', async(req, res) => {
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {email : email}
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/carts', async(req, res) => {
      const item = req.body;
      console.log(item)
      const result = await cartCollection.insertOne(item);
      res.send(result);
    })

    // Cart Delete Api :::::
    app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query)
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
    res.send("Boss is Loading ..")
})

app.listen(port, () => {
    console.log(`BIstro Boss Done .. ${port}`)
})



/* -------------------------------------
            NAMING CONVENTION
---------------------------------------*/


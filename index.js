const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000
require('dotenv').config()

// middleware
app.use(express.json())
app.use(cors())

// username: imancarrazi777
// password: OZd62us35dBXa64H 


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@job-portal-mern.e7eovrp.mongodb.net/?retryWrites=true&w=majority&appName=job-portal-mern`;

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

    const database = client.db("mernJob");
    const jobsCollection = database.collection("demoJobs");


    app.post('/add-jobs', async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      const result = await jobsCollection.insertOne(body);
      if(result.insertedId){
        return res.status(200).send(result)
      } else {
        return res.status(400).send({
          message: 'Something went wrong',
          status: false

        })
      }
    })

    app.get('/all-jobs', async (req, res) => {
      const jobs = await jobsCollection.find({}).toArray();
      res.send(jobs)
    })

    // delete a job
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const filter = { _id: new ObjectId(id) };
        const result = await jobsCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).send({ message: "Failed to delete job" });
      }
    });

    // get single job using id
    app.get("/all-jobs/:id", async(req, res) => {
      const id =  req.params.id;
      const job = await jobsCollection.findOne({
        _id: new ObjectId(id)
      })
      res.send(job)
    })

    //getJobs by email
    app.get("/myJobs/:email", async (req, res) => {
      const jobs = await jobsCollection.find({postedBy: req.params.email}).toArray();
      res.send(jobs)
    })

    // UPDATE A JOB
    app.patch("/update-job/:id", async(req, res) => {
      const id = req.params.id;
      const jobData = req.body;
      const filter = {_id: new ObjectId(id)}
      const option = { upsert: true}
      const updateDoc = {
        $set: {
          ...jobData
        },
      };
      const result = await jobsCollection.updateOne(filter, updateDoc, option);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
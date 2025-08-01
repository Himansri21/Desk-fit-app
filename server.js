import app from "./app.js"

const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{
  console.log("the application is listening on port 3001")
})
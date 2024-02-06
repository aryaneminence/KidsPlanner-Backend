const mongoose=require("mongoose")
const url =`mongodb+srv://aryantrivedieminence:feXnQRMDLiXUslAN@ecommercestore.87yxwpa.mongodb.net/?retryWrites=true&w=majority`
const Connection =async()=>{
    try {
   mongoose.connect(process.env.URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
   })

    console.log("Database Connection Succsessfully")
    } catch (error) {
    console.log("Failure in Database Connection")
    }
}



module.exports=Connection
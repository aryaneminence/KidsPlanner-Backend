const mongoose=require('mongoose')
const Content=require('../models/Content')


const createContent=async(req,res)=>{
try {
const {name,subcategory,status}=req.body  
const newCategory=await new Content({
    name:name,
    subcategory:subcategory,
    status:status
})
await newCategory.save()
console.log("category saved successfully")
res.json({message:newCategory})
} catch (error) {
console.log(error)
res.json({message:error}) 
}}


const updateContent=async(req,res)=>{
try {
const {contentId}=req.params
const {name,subcategory,status}=req.body  
const updatedContent= await Content.findByIdAndUpdate(contentId,
    {
     name:name,
     subcategory:subcategory,
     status:status
    }
)
console.log("category updated successfully")
res.status(201).json({message:updatedContent})
if(!updateContent){
   res.json({message:"content not updated"})
}
} catch (error) {
console.log(error)
res.json({message:error}) 
}}

const getContent=async(req,res)=>{
    try {
    const allContent= await Content.find()   
    res.status(201).json({message:allContent}) 
    console.log("getContent Successfull")
    } catch (error) {
    console.log(error)
    res.json({message:error}) 
    }
}
const getContentById=async(req,res)=>{
    try {
    const {contentId}=req.params
    const content= await Content.findById(contentId)
    res.json({message:content})
    console.log(content)
    } catch (error) {
    console.log(error)
    res.json({message:error}) 
    }
}
const deleteContent=async(req,res)=>{
    try {
    const {contentId}=req.params
    const deletedContent=await Content.findByIdAndDelete(contentId)
    res.status(201).json({message:deletedContent})
    console.log("content deleted sucessfully")
    } catch (error) {
    console.log(error) 
    res.json({message:error})
    }
}




module.exports={
createContent,
updateContent,
getContent,
getContentById,
deleteContent
}
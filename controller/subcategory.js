const mongoose=require('mongoose')
const subcategory=require('../models/subcategory')
const Content=require('../models/Content')


const creatSubcategory = async (req, res) => {
    try {
        const { name, categoryId, status } = req.body;
        const saveSub = await new subcategory({
            name: name,
            status: status
        }).save();
        console.log('Created Subcategory successfully:', saveSub);
        const updatedCategory = await Content.findByIdAndUpdate(
            categoryId,
            { $push: { subscategory:saveSub._id } },
            { new: true, runValidators: true }
        );
        console.log('Updated Category with new subcategory:', updatedCategory);
        res.status(201).json({ message: saveSub });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error });
    }
};
const getSubcategory=async(req,res)=>{
    try {
     const getSub= await subcategory.find()   
     res.status(201).json({message:getSub})
     console.log("getsubcategory successfull")
    } catch (error) {
       console.log(error)
       res.json({message:error}) 
    }
}

const getSubcategoryById=async(req,res)=>{
    try {
     const {subcategoryId}=req.params
     const getSingle=await subcategory.findById(subcategory) 
     res.status(201).json({message:getSingle})  
     console.log("get single successfull")
    } catch (error) {
       console.log(error)
       res.json({message:error}) 
    }
}


const updateSubcategory=async(req,res)=>{
    try {
        
    } catch (error) {
       console.log(error)
       res.json({message:error}) 
    }
}

const deleteSubcategory=async(req,res)=>{
    try {
        
    } catch (error) {
       console.log(error)
       res.json({message:error}) 
    }
}


module.exports={
    creatSubcategory,
    getSubcategory,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory
}
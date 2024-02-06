const Profile=require('../Models/Profile')
const mongoose=require('mongoose')

// CREATE PROFILE


const createProfile=async(req,res)=>{
try {
const{userId, avatar,name,age,preferences,grade} =req.body
if(!userId){
    res.json({message:"Please provide a valid userId"})
}
const profile= new Profile({
    userId:userId,
    avatar:avatar,
    name:name,
    age:age,
    preferences:preferences,
    grade:grade
}) 
await profile.save()
console.log("profile created Successfully")
res.status(201).json({message:"Profile created Successfully",profile,})
    } catch (error) {
       console.log(error) 
       res.json({message:error})
    }
}

//UPDATE PROFILE


const updateProfile=async(req,res)=>{
    try {
const userId=req.params 
const{avatar,name,age,preferences,grade} =req.body

const profile = await Profile.findById(userId)
if(!profile){
    res.json({message:"Profile not Found"})
}
profile.avatar=avatar,
profile.name=name,
profile.age=age,
profile.preferences=preferences,
profile.grade=grade

await profile.save()
res.status(201).json({message:"Profile Updated Successfully"})
    } catch (error) {
console.log(error) 
res.json({message:error}) 
    }
}

       //GET PROFILE
const getProfile = async (req, res) => {
try {
 const profile = req.params.profile; 
const userprofile = await Profile.findById(profile);
  if (!profile) {
  return res.status(404).json({ message: 'Profile not found' });
  }
res.status(200).json({ message: "Get Profile Successful", userprofile });
console.log("Get Profile Successful")
} catch (error) {
console.error(error);
res.status(500).json({ message: error });
 }
      }


          //GET PROFILES
const getProfiles=async(req,res)=>{
 try {
 const profiles= await Profile.find() 
 res.status(201).json({message:"Profile get Succsessfull",profiles})      
} catch (error) {
  console.log(error) 
 res.json({message:error})  
}
}



              //DELETE PROFILES
const delProfile = async (req, res) => {
try {
const profile = req.params.profile; 
 const deletedProfile = await Profile.findByIdAndDelete(profile);         
  if (!deletedProfile) {
 return res.status(404).json({ message: 'Profile not found' });
 }
console.log("Profile Deleted Successfully");
res.status(201).json({ message: 'Profile Deleted Successfully' ,deletedProfile});
} catch (error) {
console.log(error);
res.status(500).json({ message: error });
 }
          }



module.exports={
    createProfile,
    updateProfile,
    delProfile,
    getProfile,
    getProfiles
}

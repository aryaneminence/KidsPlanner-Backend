const express=require('express')
const { createProfile,updateProfile,delProfile, getProfile, getProfiles}=require('../controller/UserProfile')

const router=express.Router()

router.post('/creatprofile',createProfile)

router.put('upprofile/:userId',updateProfile)

router.get('/getprofile/:profile',getProfile)

router.get('/getprofiles',getProfiles)

router.delete('/delprof/:profile',delProfile)


module.exports=router
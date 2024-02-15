const express= require('express')
const router=express.Router()
const {register,socialRegister,forgetPassword,verifyPassword}=require('../controller/Authentication')

router.post("/register",register)
router.post("/login")
router.post("/socialreg",socialRegister)
router.post("/forget",forgetPassword)
router.post("/veri",verifyPassword)

module.exports=router

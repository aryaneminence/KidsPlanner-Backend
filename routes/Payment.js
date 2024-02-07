const express=require('express')
const router=express.Router()
const {Third,updateSubscription,retrieveSubscription,listSubscription,cancelSubscription}=require('../controller/Stripe')
const { creatProduct,getProducts,getproductById, deleteProduct}=require('../controller/Products')


router.post('/third',Third)

router.post('/upsub/:subscriptionId',updateSubscription)
 
router.get('/ret/:subscriptionId',retrieveSubscription)

router.get('/listsub',listSubscription)

router.delete("/cansub/:subscriptionId",cancelSubscription)





router.post('/addproduct',creatProduct)

router.get('/getproducts',getProducts)


router.get('/getproduct/:productId',getproductById)

router.delete('/del/:productId',deleteProduct)




module.exports=router
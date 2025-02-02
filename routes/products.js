const express = require('express');
const router = express.Router();
const data = require('../data');
const shopData = data.shop;
const productData = data.products;
const userData = data.user;
var mongoose = require('mongoose');

router.get('/:id', async function (req, res) {
    const idd = req.params.id;
    const shopDetail = await shopData.get(idd);
    var shopName = shopDetail.name
    var shopId = shopDetail._id;
    var shopMessage = shopDetail.message;
    var shopComment = shopDetail.comment;
    var overRating = shopDetail.overallRating;
    var noItem;
    var noMessage;
    var noComment;
    var messages;
    var comments;
    var noRating;
    var averageRating;

    const allProduct = await productData.getAllProduct(idd);
    const allProductBeforeExpire = await productData.allProductBeforeExpire(idd);
    var x = allProductBeforeExpire

    if (allProduct.overallRating == 0) {
        noRating = "No Rating for your shop"
    } else {
        averageRating = overRating
    }

    if (allProduct.item.length == 0) {
        noItem = "No product in Database"
    }
    if (allProduct.message.length != 0) {
        messages = shopMessage
    }
    if (allProduct.message.length == 0) {
        noMessage = "No message in Inbox"
    }
    if (allProduct.comment.length != 0) {
        comments = shopComment
    }
    if (allProduct.comment.length == 0) {
        noComment = "No comment in Your Shop"
    }
    const dataa = {
        allItem: allProduct.item,
        noRating: noRating,
        averageRating: averageRating,
        title: shopName,
        shopId: shopId,
        msgForShop: messages,
        commentForShop: comments,
        messageForMessage: noMessage,
        messageProduct: noItem,
        noComment: noComment
    };
    res.render('allItem', dataa);
    return;

});

router.get('/addItem/:id', async function (req, res) {
    const shopid = req.params.id;
    const shopDetail = await shopData.get(shopid);
    var shopName = shopDetail.name
    const dataa = {
        shopId: shopid,
        shopName: shopName
    };
    res.render('addItem', dataa);
});

router.get('/editItem/:id', async function (req, res) {
    var itemId = req.params.id;
    var restDetail = await productData.getShopIdForEditItem(itemId);
    var itemDetail = await productData.getProductDetail(restDetail._id, itemId)
    var data = {
        shopId: restDetail._id,
        itemDetail: itemDetail
    }
    res.render('edititem', data)
});

router.put('/:id', async function (req, res) {
    const iddProduct = req.params.id;
    const {
        productname,
        productdetails,
        producthighlights,
        price,
        quantityremaining,
        dateofmanufacture,
        dateofexpiry
    } = req.body;

    try {
        var restDetail = await productData.getShopIdForEditItem(iddProduct);
        var itemDetail = await productData.getProductDetail(restDetail._id, iddProduct)
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
    var priceNum = parseInt(price)
    var qtyRem = parseInt(quantityremaining)

    try {
        if ((!productname) || typeof productname != 'string') {
            var data = {
                message: `productname "${productname}" is not valid`,
                shopId: restDetail._id,
                itemDetail: itemDetail
            }
            res.status(400)
            res.render('edititem', data)
            return;
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
    try {
        if ((!productdetails) || typeof productdetails != 'string' || (!productdetails.match(/^[0-9A-z]{5,}$/))) {
            var data = {
                message: `productdetails "${productdetails}" is not valid or not atleast 5 charcture`,
                shopId: restDetail._id,
                itemDetail: itemDetail
            }
            res.status(400)
            res.render('edititem', data)
            return;
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
    try {
        if ((!producthighlights) || typeof producthighlights != 'string') {
            var data = {
                message: `producthighlights "${producthighlights}" is not valid`,
                shopId: restDetail._id,
                itemDetail: itemDetail
            }
            res.status(400)
            res.render('edititem', data)
            return;
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
    try {
        if ((!price) || (!price.match(/^(?!0\d)\d*(\.\d+)?$/))) {
            var data = {
                message: `Price "${price}" is not valid`,
                shopId: restDetail._id,
                itemDetail: itemDetail
            }
            res.status(400)
            res.render('edititem', data)
            return;
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }

    try {
        if ((!quantityremaining) || typeof qtyRem != 'number' || (!quantityremaining.match(/^[0-9]{1,}$/))) {
            var data = {
                message: `quantityremaining "${quantityremaining}" is not valid or not atleast 5 charcture`,
                shopId: restDetail._id,
                itemDetail: itemDetail
            }
            res.status(400)
            res.render('edititem', data)
            return;
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }

    try {
        const updateStore = await productData.updateProduct(
            iddProduct,
            productname,
            productdetails,
            producthighlights,
            price,
            quantityremaining,
            dateofmanufacture,
            dateofexpiry
        )
        var restDetail = await productData.getShopIdForEditItem(iddProduct);
        var itemDetail = await productData.getProductDetail(restDetail._id, iddProduct)
        if (typeof updateStore == "string") {
            var data = {
                shopId: restDetail._id,
                itemDetail: itemDetail,
                message: updateStore
            }
            res.status(400)
            res.render('edititem', data)
            return;
        }
        var shopId = updateStore._id;
        res.redirect(`/shopId/${shopId}`)
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

router.post('/:iduser/:storeId', async function (req, res) {
    const iduser = req.params.iduser; // in object
    const storeId = req.params.storeId; // in string
    const {
        replayMessage
    } = req.body;
    try {
        await userData.replayMessage(iduser, storeId, replayMessage)
        res.redirect(`/shopId/${storeId}`)
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
})

router.post('/:id', async function (req, res) {
    const idProduct = req.params.id;
    const {
        productname,
        productdetails,
        producthighlights,
        price,
        quantityremaining,
        dateofmanufacture,
        dateofexpiry,
    } = req.body;

    try {

        const newItem = await productData.createProduct(
            idProduct,
            productname,
            productdetails,
            producthighlights,
            price,
            quantityremaining,
            dateofmanufacture,
            dateofexpiry
        );
        if (typeof newItem == "string") {
            console.log(newItem)
            const shopDetail = await shopData.get(idProduct);
            var shopMessage = shopDetail.message;
            var shopComment = shopDetail.comment;
            var noItem;
            var noMessage;
            var noComment;
            var messages;
            var comments;
            var noRating;
            var averageRating;
            const allProducts = await productData.getAllProduct(idProduct);
            await productData.allProductBeforeExpire(idProduct);
            console.log("a")
            if (allProducts.item.length == 0) {
                noItem = "No product in Database"
            }
            if (allProducts.message.length != 0) {
                messages = shopMessage
            }
            if (allProducts.message.length == 0) {
                noMessage = "No message in Inbox"
            }
            if (allProducts.comment.length != 0) {
                comments = shopComment
            }
            if (allProducts.comment.length == 0) {
                noComment = "No comment in Your Shop"
            }
            if (allProducts.overallRating == 0) {
                noRating = "No Rating for your shop"
            } else {
                averageRating = allProducts.overRating
            }
            console.log("ab")

            var shopName = shopDetail.name
            var shopId = shopDetail._id;
           // if (allProducts.item.length != 0) {
                const data = {
                    allItem: allProducts.item,
                    title: shopName,
                    shopId: shopId,
                    msgForShop: messages,
                    commentForShop: comments,
                    messageForMessage: noMessage,
                    messageProduct: noItem,
                    noComment: noComment,
                    messagetoCreateProduct: newItem,
                    noRating: noRating,
                    averageRating: averageRating,
                }
                console.log(data.messagetoCreateProduct)
                res.status(400)
                res.render("allItem", data)
                return;
            //}
        }
        res.redirect(`/shopId/${idProduct}`)
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

router.delete('/delete/:id', async function (req, res) {
    const itemorMessageId = req.params.id;
    try {
        var restDetail = await productData.getShopIdForEditItem(itemorMessageId);
        if (typeof restDetail == 'string') {
            restDetailforMessage = await productData.getShopIdForDeleteMessage(itemorMessageId);
            const shopDetailId = await productData.removeMessage(restDetailforMessage, itemorMessageId);
            res.redirect(`/shopId/${shopDetailId}`)
        } else {
            const shopDetail = await productData.remove(restDetail, itemorMessageId);
            res.redirect(`/shopId/${shopDetail}`)
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }

})

module.exports = router;
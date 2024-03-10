// total weight
let weight = 0;
let itemWei = 0;
let itemPcs = 0;
let calculatedWei = 0;
document.querySelectorAll('.cart-list .product-list').forEach(item => {
    item.querySelectorAll('.title').forEach(item => {
        itemWei = item.getAttribute('data-product-weight');
        itemPcs = item.getAttribute('data-quantity');
        var numWei = parseFloat(itemWei.replace(',', '.'));
        var subItemWei = numWei*Number(itemPcs);
        if (subItemWei) {
            calculatedWei += Number(subItemWei);
        }        
    })
})
document.querySelector('.weight-value').innerHTML = calculatedWei.toFixed(2) + ' kg';


// remove all
$(document).on('click', '.cart-delete-all', function(e){
    e.preventDefault();
    var ids = [];
    document.querySelectorAll('.product-list li').forEach(item => {
        let id = item.getAttribute('data-item-id');
        ids.push(id);
        $.ajax({
            type: 'GET',
            url: '/cart/clear.js',
            data: {
              id: ids
            },
            success: function(){
                window.location.href= '/cart';
            }
        })
    })

})

// remove product
$(document).on("click", ".jc-cart-remove", function (e) {
    e.preventDefault();
    var updates = {};
    var data = {};
    if ($(this).data('properties').length > 2) {
        let $cartpc = $(this).val();
        let mainProductId = $(this).closest('.item').data('item-id');
        let palletNum = $(this).data('properties')[0][1];
        let main_Product_Id = $(this).data('properties')[1][1];
        let subProductId1 = $(this).data('properties')[2][1];
        let subProductId2 = $(this).data('properties')[3][1];
        let $breaking_val = $cartpc % palletNum;
    
        $(this).closest('.product-list')[0].querySelectorAll('.custom-product').forEach(item=> {
            let str_selectedId = item.querySelector('input').getAttribute('data-properties');
            let selectedId = JSON.parse(str_selectedId)[0][1];
            if (selectedId == main_Product_Id ) {
                var key = item.getAttribute('data-item-key');
                updates[key] = 0;

                data = {
                items: [
                    {
                        id: mainProductId,
                        quantity: 0,
                        properties: {
                            '_pallet_num': palletNum,
                            '_mainproduct_id': main_Product_Id,
                            '_subproduct_id_0': subProductId1,
                            '_subproduct_id_1': subProductId2
                        }
                    },
                    {
                        id: subProductId1,
                        quantity: 0,
                        properties: {
                            '_mainproduct_id': main_Product_Id,
                        }
                    }
                    ]
                }

                if ($breaking_val != 0) {
                    data = {
                        items: [
                            {
                                id: mainProductId,
                                quantity: 0,
                                properties: {
                                    '_pallet_num': palletNum,
                                    '_mainproduct_id': main_Product_Id,
                                    '_subproduct_id_0': subProductId1,
                                    '_subproduct_id_1': subProductId2
                                }
                            },
                            {
                                id: subProductId1,
                                quantity: 0,
                                properties: {
                                    '_mainproduct_id': main_Product_Id
                                }
                            },
                            {
                                id: subProductId2,
                                quantity: 0,
                                properties: {
                                    '_mainproduct_id': main_Product_Id
                                }
                            }
                        ]
                    }
                }      
                
                updates[$(this).closest('.item').data('item-key')] = 0;
            }
        })
    } else {
        var nomalProductId = $(this)[0].id.split('_')[1];
        var productNum = $(this).val();
        var nomalProductKey = $(this).closest('.item')[0].getAttribute('data-item-key');
        updates[nomalProductKey] = 0;

        data = {
            items: [
                {
                    id: nomalProductId,
                    quantity: 0
                    
                }
                
            ]
        }
    }
    itemDelete(updates, data)
    
})

// click +, - button
$(document).on('change', '.jc-cart-value', function(e) {
    e.preventDefault();
    changeItem($(this));
})
$(document).on('keyup', '.jc-cart-value', function(e) {
    e.preventDefault();
    changeItem($(this));
})

$('.jc-cart .minus').click(function(e){
    e.preventDefault();
    var $input = $(this).closest('.jc-cart').find('input');
    let qty = $input.val();
    let type = $input.data('type');
    if(qty > 0) {
        if (type == "ratio") {
        let ratio = $input.closest('.quantity-section').find('.ratio input');
        let consequent = ratio.data('consequent');
        let ratioValue = 1/consequent;
        $input.val(Number(qty) - ratioValue);

        } else if (type == "bags"){
            let ratio = $input.closest('.quantity-section').find('.ratio input');
            let consequent_bags = ratio.data('consequent');
            $input.val(Number(qty) - consequent_bags);
        } else {
            $input.val(Number(qty) - 1);
        }
        changeItem($input);
    }
});

$('.jc-cart .plus').click(function(e){
    e.preventDefault();
    var $input = $(this).closest('.jc-cart').find('input');
    let qty = $input.val();
    let type = $input.data('type');
    if (type == "ratio") {
        console.log(type, "ratio");
        let ratio = $input.closest('.quantity-section').find('.ratio input');
        let consequent = ratio.data('consequent');
        let ratioValue = 1/consequent;
        console.log(ratioValue);
        console.log(qty);
        $input.val(Number(qty) + ratioValue);

    }else if (type == "bags"){
        console.log(type, "bags");

        let ratio = $input.closest('.quantity-section').find('.ratio input');
        let consequent_bags = ratio.data('consequent');
        $input.val(Number(qty) + consequent_bags);
    } else {
        console.log("others");
        $input.val(Number(qty) + 1);
    }

    changeItem($input);
});

// +, - product

function changeItem(_this) {
    var updates = {};
    var data ={};

    let ratio = _this.closest('.quantity-section').find('.ratio input');
    let pall = _this.closest('.quantity-section').find('.pall input');
    let product = _this.closest('.quantity-section').find('.pro input');
    var bags = _this.closest('.quantity-section').find('.bags input');


    var $cartpc = _this.val();
    var consequent = ratio.data('consequent');
    var ratioUnit = 1/consequent;
    var dataType=_this.data('type');
    var productValue;
    var palletValue;
    var ratioValue;
    
    
    if (_this.data('properties').length > 2) {      
        
        var palletNum = _this.data('properties')[0][1];
        if (dataType == "product") {
            ratio.val(Math.max(0, parseFloat(parseInt($cartpc) / parseFloat(consequent).toFixed(2))));
            pall.val(Math.max(0, (parseInt($cartpc) / palletNum).toFixed(3)));   
            productValue = $cartpc;   
            palletValue = Math.max(0, (parseInt($cartpc) / palletNum).toFixed(3));
            ratioValue = Math.max(0, parseFloat(parseInt($cartpc) / parseFloat(consequent).toFixed(2)));
        }
        if (dataType == "pallet") {
            palletValue = Math.ceil(parseInt($cartpc));
            pall.val(palletValue);
            productValue = Number(palletValue)*Number(palletNum);
            product.val(productValue);
            ratioValue = Number(productValue)/consequent;
            ratio.val(Number(productValue)/consequent);
        }
        if (dataType == "ratio") {
            ratioValue = Number(_this.val());
            productValue = Math.ceil(ratioValue / ratioUnit);
            ratio.val(ratioValue.toFixed(2));
            if (ratioValue.toFixed(2) == 0) {
                ratio.val(0);
            }
            product.val(productValue);
            palletValue = Math.max(0, (productValue / palletNum).toFixed(2));
            pall.val(Math.max(0, (productValue / palletNum).toFixed(2)));
        }
        let mainProductId = _this.closest('.item').data('item-id');
        let main_Product_Id = _this.data('properties')[1][1];
        let subProductId1 = _this.data('properties')[2][1];
        let subProductId2 = _this.data('properties')[3][1];
        let $breaking_val = productValue % palletNum;   
        
        _this.closest('.product-list')[0].querySelectorAll('.custom-product').forEach(item=> {
            let str_selectedId = item.querySelector('input').getAttribute('data-properties');
            let selectedId = JSON.parse(str_selectedId)[0][1];
            if (selectedId == main_Product_Id ) {

                let key = item.getAttribute('data-item-key');
                updates[key] = 0;

                data = {
                    items: [
                        {
                            id: mainProductId,
                            quantity: productValue,
                            properties: {
                                '_pallet_num': palletNum,
                                '_mainproduct_id': main_Product_Id,
                                '_subproduct_id_0': subProductId1,
                                '_subproduct_id_1': subProductId2                                
                            }
                        },
                        {
                            id: subProductId1,
                            quantity: palletValue,
                            properties: {
                                '_mainproduct_id': main_Product_Id,
                                '_ismain': "false"
                            }
                        }
                    ]
                }

                if ($breaking_val != 0) {
                    data = {
                        items: [
                            {
                                id: mainProductId,
                                quantity: productValue,
                                properties: {
                                    '_pallet_num': palletNum,
                                    '_mainproduct_id': main_Product_Id,
                                    '_subproduct_id_0': subProductId1,
                                    '_subproduct_id_1': subProductId2                                    
                                }
                            },
                            {
                                id: subProductId1,
                                quantity: Math.ceil(palletValue),
                                properties: {
                                    '_mainproduct_id': main_Product_Id,
                                    '_ismain': "false"
                                }
                            },
                            {
                                id: subProductId2,
                                quantity: 1,
                                properties: {
                                    '_mainproduct_id': main_Product_Id,
                                    '_ismain': "false"
                                }
                            }
                        ]
                    }
                }    
                updates[_this.closest('.item').data('item-key')] = 0;
            }
        })
         
        itemsUpdate(updates, data);        

    } else {
        console.log(_this[0], "here");
        var nomalProductId = _this[0].id.split('_')[1];
        var productNum = _this.val();
        var productPrice = _this[0].getAttribute('data-price');
        var nomalProductKey = _this.closest('.item')[0].getAttribute('data-item-key');
        
        var presentPriceWrapper = _this.closest('.item').find('.line-total .money');
        var presentPrice = presentPriceWrapper.text();
        var bagsSquare = _this[0].getAttribute('data-consequent');

        
        if (_this[0].getAttribute('data-type') == "bags") {
            console.log("bags");
            console.log(bagsSquare, "square");
            console.log(_this.val(), "Numqweqweqewqe");
            var bagsValue = productNum / Number(bagsSquare);
            console.log(bagsValue, "value");
            bags.val(Math.ceil(bagsValue));
            productNum = bagsValue;
            
        }
        if (_this[0].getAttribute('data-type') == "bags-quantity") {
            console.log(productNum, "number");
            console.log(bagsSquare, "square");
            ratio.val(Number(productNum)*Number(bagsSquare));
            
        }
        if (productNum == 0) {
            _this.closest('.item')[0].style.display = 'none';                
        }
        updates[nomalProductKey] = 0;

        data = {
            items: [
                {
                    id: nomalProductId,
                    quantity: productNum
                    
                }
                
            ]
        }

        $.ajax({
        type: 'POST',
        url: '/cart/update.js',
        data: {
            updates:updates
        },
        dataType: 'json',
        async:false,  // Be warned, async:false has been deprecated in jQuery for a long time and is not recommended for use. It's generally recommended to use callbacks or promises instead
        success: function(){
            $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: data,
                dataType: 'json',
                async:false,  // Be warned, async:false has been deprecated in jQuery for a long time and is not recommended for use. It's generally recommended to use callbacks or promises instead
                success: function(){
                    // window.location.href= '/cart';
                    
                    let originalString = presentPrice.slice(0, -3);
                    let cleanedString = originalString.replace(/[,\.]/g, "");
                    let numberValue = parseInt(cleanedString);
                    
                            var updatePrice = Number(productPrice)/100 * productNum;
                            _this.closest('.item').find('.line-total .money').text(Math.round(updatePrice).toLocaleString("en") + '.00' + ' kr');
                            var distance = updatePrice - numberValue/100;

                            var presentTotal = document.querySelector('.under-cart .money').innerHTML;

                            let original = presentTotal.slice(0, -3);
                            let cleaned = original.replace(/[,\.]/g, "");
                            let numberT = parseInt(cleaned);

                            let updateTotal = numberT/100 + distance ;
                            document.querySelector('.under-cart .money').innerHTML = Math.round(updateTotal).toLocaleString("en") + '.00' + ' kr';



                }
            });
        }
    })

    }

}

// function

function itemsUpdate(updates, data) {
    $.ajax({
        type: 'POST',
        url: '/cart/update.js',
        data: {
            updates:updates
        },
        dataType: 'json',
        async:false,  // Be warned, async:false has been deprecated in jQuery for a long time and is not recommended for use. It's generally recommended to use callbacks or promises instead
        success: function(){
            $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: data,
                dataType: 'json',
                async:false,  // Be warned, async:false has been deprecated in jQuery for a long time and is not recommended for use. It's generally recommended to use callbacks or promises instead
                success: function(){
                    window.location.href= '/cart';
                }
            });
        }
    })
}

// delete
function itemDelete(updates, data) {
    $.ajax({
    type: "POST", 
    url: "/cart/update.js",
    data: {
    updates: updates,
    },
    dataType: "json",
    // Be warned, async: false has been deprecated in jQuery for a long time and is not recommended for use. It's generally recommended to use callbacks or promises instead
    success: function () {
    window.location.href = "/cart";
    },
});
}





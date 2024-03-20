jQuery(window).on("load", function () {    
    if (window.location.href === "https://stengrossen.se/cart") {
        console.log("Page has finished loading");
        document.querySelectorAll('.cart-list .product-list').forEach(item => {
            item.querySelectorAll('.pallet__product').forEach(Item=> {
                let clickPlus = Item.querySelector('.item-quantity.pro .plus');
                let clickMinus = Item.querySelector('.item-quantity.pro .minus');
                let pc = Item.querySelector('.item-quantity.pro input').value;
                pc = Math.ceil(pc);
                setTimeout(()=> {
                    clickPlus.click( function(e) {
                        e.preventDefault;
                        var $input = $(this).closest('.jc-cart').find('input');
                        let qty = $input.val();
                        $input.val(Number(qty) + 1);
                        changeItem($input);
                    });
            
                    clickMinus.click( function(e) {
                        e.preventDefault;
                        var $input = $(this).closest('.jc-cart').find('input');
                        let qty = $input.val();
                        $input.val(Number(qty) - 1);
                        changeItem($input);
                    });
        
                }, 1000);                    
            })
        })
    }      
});

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
        $input.val((Number(qty) - ratioValue).toFixed(2));

        } else if (type == "bags"){
            let ratio = $input.closest('.quantity-section').find('.ratio input');
            let consequent_bags = ratio.data('consequent');
            $input.val(Number(qty) - consequent_bags);
        } else {
            $input.val(Number(qty) - 1);
        }

        console.log("click - btn");

        changeItem($input);
    }
    
});

$('.jc-cart .plus').click(function(e){
    e.preventDefault();
    var $input = $(this).closest('.jc-cart').find('input');
    let qty = $input.val();
    let type = $input.data('type');
    if (type == "ratio") {
        let ratio = $input.closest('.quantity-section').find('.ratio input');
        let consequent = ratio.data('consequent');
        let ratioValue = 1/consequent;
        $input.val((Number(qty) + ratioValue).toFixed(2));
    }else if (type == "bags"){

        let ratio = $input.closest('.quantity-section').find('.ratio input');
        let consequent_bags = ratio.data('consequent');
        $input.val(Number(qty) + consequent_bags);
    } else {
        $input.val(Number(qty) + 1);
    }
    console.log("click + btn");
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
            ratio.val(Math.max(0, parseFloat(parseInt($cartpc) / parseFloat(consequent)).toFixed(2)));
            pall.val(Math.max(0, (parseInt($cartpc) / palletNum).toFixed(3)));   
            productValue = $cartpc;   
            palletValue = Math.max(0, (parseInt($cartpc) / palletNum).toFixed(3));
            ratioValue = Math.max(0, parseFloat(parseInt($cartpc) / parseFloat(consequent)).toFixed(2));
            console.log();
        }
        if (dataType == "pallet") {
            palletValue = Math.ceil(parseInt($cartpc));
            pall.val(palletValue);
            productValue = Number(palletValue)*Number(palletNum);
            product.val(productValue);
            ratioValue = Number(productValue)/consequent;
            ratio.val((Number(productValue)/consequent).toFixed(2));
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
        console.log(productValue, "productValue");
        
        _this.closest('.product-list')[0].querySelectorAll('.custom-product').forEach(item=> {
            let str_selectedId = item.querySelector('input').getAttribute('data-properties');
            let selectedId = JSON.parse(str_selectedId)[0][1];
            if (selectedId == main_Product_Id ) {
                if (productValue == 0) {
                    console.log("00000");
                    _this.closest('.item')[0].style.display = "none";
                    item.style.display = "none";
                }
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
                                '_mainproduct_id': main_Product_Id
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
                                }
                            },
                            {
                                id: subProductId2,
                                quantity: 1,
                                properties: {
                                    '_mainproduct_id': main_Product_Id,
                                }
                            }
                        ]
                    }
                }    
                updates[_this.closest('.item').data('item-key')] = 0;
            }
        })
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
                        $.ajax({
                            type: 'GET',
                            url: '/cart.js',
                            dataType: 'json',
                            success: function(cartdata){
                                
                                let productPrice = _this[0].getAttribute('data-price');
                                let $breaking_val = productValue % palletNum; 
                                
                                _this.closest('.product-list')[0].querySelectorAll('.custom-product').forEach(item=> {

                                    var palletPrice = item.querySelector('input').getAttribute('data-price');
                                    let str_selectedId = item.querySelector('input').getAttribute('data-properties');
                                    let selectedId = JSON.parse(str_selectedId)[0][1];

                                    if (selectedId == main_Product_Id) {

                                        let palletId = item.closest('.custom-product').getAttribute('data-item-id');
                                        let priceEelement = _this.closest('.item')[0].querySelector('.line-total .money');                                        
                                        priceEelement.innerHTML = (productValue * Number(productPrice) /100).toFixed(2) + ' kr';                                        
                                        let palletElement = item.closest('.custom-product').querySelector('.line-total .money');
                                        var breakingPriceElement = item.closest('.custom-product').querySelector('.line-total .money');

                                        if ($breaking_val == 0) {
                                            if ( palletId == subProductId2 ) {
                                                item.closest('.custom-product').style.display = "none";   
                                                breakingPriceElement.innerHTML = 0;

                                            }
                                        } else {
                                            if ( palletId == subProductId2 ) {
                                                item.closest('.custom-product').style.display = "flex"; 
                                                item.querySelector('.custom-product .product-quantity .product-price').innerHTML = "Antal: 1";
                                                let breakingPrice = item.closest('.custom-product').querySelector('input').getAttribute('data-price');
                                                breakingPriceElement.innerHTML = (Number(breakingPrice) /100).toFixed(2) + ' kr';
                                            }
                                        }

                                        if ( palletId == subProductId1 ) {
                                            palletElement.innerHTML = (palletPrice * Number(Math.ceil(palletValue) /100)).toFixed(2) + ' kr';
                                            let palletNumElement = item.closest('.custom-product').querySelector('.product-quantity .product-price');
                                            let palletNumValue = item.closest('.custom-product').querySelector('.product-quantity .weight input');
                                            $(palletNumValue).val(Math.ceil(palletValue));
                                            console.log(palletNumValue, "item");
                                            palletNumElement.innerHTML = 'Antal: ' + Math.ceil(palletValue);
                                        }

                                        totalPrice();
                                        totalWeight();
                                        
                                    }
                                })
                            }
                        });
                    }
                });
            }
        })       
    


    } else {
        var nomalProductId = _this[0].id.split('_')[1];
        var productNum = _this.val();
        var productPrice = _this[0].getAttribute('data-price');
        var nomalProductKey = _this.closest('.item')[0].getAttribute('data-item-key');        
        var presentPriceWrapper = _this.closest('.item').find('.line-total .money');
        var presentPrice = presentPriceWrapper.text();
        var bagsSquare = _this[0].getAttribute('data-consequent');
        
        if (_this[0].getAttribute('data-type') == "bags") {
            var bagsValue = productNum / Number(bagsSquare);
            bags.val(Math.ceil(bagsValue));
            productNum = bagsValue;            
        }
        if (_this[0].getAttribute('data-type') == "bags-quantity") {
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
                        totalPrice();
                        totalWeight();
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

// total weight
function totalWeight() {
    console.log('cal-wieght-here');
    let itemWei = 0;
    let itemPcs = 0;
    let calculatedWei = 0;
    var subItemWei = 0;
    document.querySelectorAll('.cart-list .product-list').forEach(item => {
        item.querySelectorAll('.col-notimage').forEach((item, index) => {
            itemWei = item.querySelector('.title').getAttribute('data-product-weight');                        
            itemPcs = item.querySelector('.weight input').value;   
            var numWei = parseFloat(itemWei.replace(',', '.').replace(' kg', ''));
            subItemWei = Number(numWei)*Number(itemPcs);             
            calculatedWei += Number(subItemWei);
            console.log(itemPcs, "pcs");
            console.log(numWei, "numWei");
            console.log(subItemWei, "sub");
            console.log(calculatedWei, "cal");
        })       
    })
    document.querySelector('.weight-value').innerHTML = (calculatedWei).toFixed(2) + ' kg';
}

//total price
function totalPrice() {
    let totalPrice = 0;
    let itemPrice;
    let calculatedPrice = 0;
    document.querySelectorAll('.cart-list .product-list').forEach(item => {
        item.querySelectorAll('.line-total').forEach(item => {
            itemPrice = item.querySelector('.money').innerHTML;
            totalPrice = parseFloat(itemPrice.replace(/,/g, '').replace(' kr', ''));
            calculatedPrice += Number(totalPrice);
        })
    })
    result = Number(calculatedPrice).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    resultFee = Number((Number(calculatedPrice) * 0.2).toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    document.querySelector('.subtotal .money').innerHTML =result + " kr";;
    document.querySelector('.subtotal_ .money').innerHTML = resultFee + ' kr';
}






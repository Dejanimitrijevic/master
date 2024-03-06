var pallet = document.querySelectorAll('[name="quantity"]');
var pallet_limit;
pallet.forEach(item=(){
    item.addEventListener('keyup', function(){
        pallet_limit = document.querySelector('[data-limit]');
    
        console.log(pallet_limit);
    })
})
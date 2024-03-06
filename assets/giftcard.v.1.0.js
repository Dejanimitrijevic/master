/**
 * v.1.0
 *
 * Gift Card Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Gift Card template.
 */

(function () {
  var config = {
    qrCode: 'qr-code',
    printButton: 'print-gift-card',
    giftCardCode: 'gift-card-code-digits' };


  var qrCode = document.getElementById(config.qrCode);

  new QRCode(qrCode, {
    text: qrCode.getAttribute('data-identifier'),
    width: 120,
    height: 120 });


  document.getElementById(config.printButton).addEventListener('click', function () {
    window.print();
  }, false);

  function selectText(evt) {
    var text = evt.target;
    var range = '';

    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select();
    } else if (window.getSelection) {
      var selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Auto-select gift card code on click, based on ID passed to the function
  document.getElementById(config.giftCardCode).addEventListener('click', selectText, false);
})();
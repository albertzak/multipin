MultiPin = {
  buttonHtml:     '<button class="rounded Button multiPinButton Module hasText btn">Multi Pin</button>',

  barHtml:        '<div class="Module MultiPinBar">'
                + '  <div class="boardMultiPinBar centeredWithinWrapper">'
                + '    <div class="notifications">'
                + '      <div class="Module PinCount">'
                + '        <span class="label">Select some Pins!</span>'
                + '      </div>'
                + '    </div>'
                + '    <div class="multiPinButtons">'
                + '      <button class="Module Button btn rounded primary multiPinActionButton hasText" data-element-type="401" type="button">'
                + '        <span class="buttonText">Pin them!</span>'
                + '      </button>'
                + '      <button class="Module Button btn rounded multiPinCancelButton hasText" data-element-type="404" type="button">'
                + '        <span class="buttonText">Cancel</span>'
                + '      </button>'
                + '    </div>'
                + '  </div>'
                + '</div>',

  pinWrapperHtml: '<div class="multiPinPinWrapper">'
                + '  <button type="button" class="multiPinCheckbox bulkEditCheckbox Button btn rounded Module">'
                + '    <em></em>'
                + '    <span class="accessibilityText">Multi Pin: Select Pin</span>'
                + '  </button>'
                + '</div>',

  init: function() {
    this.movePinsButton = $('.movePinsButton');
    this.isMultiPinnable = (this.movePinsButton.length > 0);
    if (this.isMultiPinnable) {
      this.injectButton();
      this.injectPinWrapper();
    }
  },

  injectButton: function() {
    this.movePinsButton.before(this.buttonHtml);
    this.multiPinButton = $('.multiPinButton');
    this.multiPinButton.click(this.toggleMultiPinning);
  },

  injectPinWrapper: function() {
    $('.pinWrapper').prepend(MultiPin.pinWrapperHtml);
    $('.multiPinCheckbox').click(function(e) {
      $(e.currentTarget).toggleClass('selected');
      MultiPin.updateSelectedCount();
    });
  },

  updateSelectedCount: function() {
    var count = $('.multiPinCheckbox.selected').length;

    if (count === 0)
      var text = 'Select some Pins!';
    if (count === 1)
      var text = '1 Pin selected';
    if (count > 1)
      var text = count + ' Pins selected';

    $('.PinCount .label').text(text);
  },

  toggleMultiPinning: function() {
    MultiPin.isMultiPinning = ($('.Module.MultiPinBar').length > 0);

    if (MultiPin.isMultiPinning) {
      MultiPin.hideBar();
      MultiPin.hideCheckboxes();
    } else {
      MultiPin.showBar();
      MultiPin.showCheckboxes();
    }
  },

  showBar: function() {
    $('.Module.BoardInfoBar').append(MultiPin.barHtml);
    $('.infoBarWrapper').css('transform', 'translate(0px, 64px)');
    setTimeout(function() {
      $('.Module.MultiPinBar').css('transform', 'translate(0px, 0px)');
    }, 10);
    $('.multiPinCancelButton').click(MultiPin.toggleMultiPinning);
    $('.multiPinActionButton').click(MultiPin.pinThem);
  },

  hideBar: function() {
    $('.Module.MultiPinBar').css('transform', 'translate(0px, -64px)');
    $('.infoBarWrapper').css('transform', 'translate(0px, 0px)');
    $('.Module.MultiPinBar').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e){
      if (e.target === e.currentTarget)
        $('.Module.MultiPinBar').remove();
    });
  },

  showCheckboxes: function() {
    $('.Pin').addClass('multiPinMode');
  },

  hideCheckboxes: function() {
    $('.Pin').removeClass('multiPinMode');
    $('.multiPinCheckbox').removeClass('selected');
  },

  pinThem: function() {
    var count = $('.multiPinCheckbox.selected').length;

    $('body').append('<script>console.log(PINS_TAB);</script>');

    console.log('Pinning', count, 'Pins');
  }

};

MultiPin.init();

chrome.extension.sendMessage({}, function(response) {
	
  var init = function() {
    movePinsButton = $('.movePinsButton');
    
    var isMultipinnable = (movePinsButton.length > 0);

    if(isMultipinnable)
      injectButton();
  };

  var injectButton = function() {
    var multiPinButtonHtml = '<button class="rounded Button multiPinButton Module hasText btn">Multi Pin</button>';
    var multiPinBarHtml = '<div class="Module MultiPinBar">'
    + '  <div class="boardMultiPinBar centeredWithinWrapper">'
    + '    <div class="notifications">'
    + '      <div class="Module PinCount ">'
    + '        <span class="label">Multi Pin: Wähle einige Pins aus!</span>'
    + '      </div>'
    + '    </div>'
    + '    <div class="multiPinButtons">'
    + '      <button class="Module Button btn rounded primary multiPinActionButton hasText" data-element-type="401" type="button">'
    + '        <span class="buttonText">Pin them!</span>'
    + '      </button>'
    + '      <button class="Module Button btn rounded multiPinCancelButton hasText" data-element-type="404" type="button">'
    + '        <span class="buttonText">Abbrechen</span>'
    + '      </button>'
    + '    </div>'
    + '  </div>'
    + '</div>';

    var toggleMultiPinBar = function() {
      var isOpen = ($('.Module.MultiPinBar').length > 0);

      if (isOpen) {
        $('.Module.MultiPinBar').css('transform', 'translate(0px, -64px)');
        $('.infoBarWrapper').css('transform', 'translate(0px, 0px)');
        $('.Module.MultiPinBar').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e){
          if (e.target === e.currentTarget)
            $('.Module.MultiPinBar').remove();
        });
      } else {
        $('.Module.BoardInfoBar').append(multiPinBarHtml);
        $('.infoBarWrapper').css('transform', 'translate(0px, 64px)');
        setTimeout(function() {
          $('.Module.MultiPinBar').css('transform', 'translate(0px, 0px)');
        }, 10);

        $('.multiPinCancelButton').click(toggleMultiPinBar);
      }

    };

    movePinsButton.before(multiPinButtonHtml);
    multiPinButton = $('.multiPinButton');
    multiPinButton.click(toggleMultiPinBar);
  };

  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
    	clearInterval(readyStateCheckInterval);
      init();
    }
	}, 10);
});

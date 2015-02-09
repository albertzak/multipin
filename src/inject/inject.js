chrome.extension.sendMessage({}, function(response) {
	
  var init = function() {
    movePinsButton = $('.movePinsButton');
    
    var isMultipinnable = (movePinsButton.length > 0);

    if(isMultipinnable) {
      injectCss();
      injectButton();
    }
  };

  var injectButton = function() {
    movePinsButton.before('<button class="rounded Button multiPinButton Module hasText btn">Multi Pin</button>');
    multiPinButton = $('.multiPinButton');
    console.log(multiPinButton);
  };

  var injectCss = function() {
    var css = '<style>'
      + '  .multiPinButton {'
      + '    margin-right: 10px;'
      + '    margin-top: -1px;'
      + '    position: relative;'
      + '    z-index: 1;'
      + '  }'
      + '</style>';

    $('head').append(css);
  };

  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
    	clearInterval(readyStateCheckInterval);
      init();
    }
	}, 10);
});

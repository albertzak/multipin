chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
    	clearInterval(readyStateCheckInterval);

      var script = document.createElement('script');
      script.src = chrome.extension.getURL('src/multipin.js');
      script.onload = function() {
        this.parentNode.removeChild(this);
      };
      (document.head||document.documentElement).appendChild(script);
    }
	}, 10);
});

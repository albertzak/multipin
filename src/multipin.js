MultiPin = {
  buttonHtml:     '<button class="rounded Button multiPinButton Module hasText btn">Multi Pin</button>',

  barHtml:        '<div class="Module MultiPinBar">'
                + '  <div class="boardMultiPinBar centeredWithinWrapper">'
                + '    <div class="notifications">'
                + '      <div class="Module PinCount">'
                +          P._("<span class='label'>Select some Pins!</span>")
                + '      </div>'
                + '    </div>'
                + '    <div class="multiPinButtons">'
                + '      <button class="Module Button btn rounded primary multiPinActionButton hasText" data-element-type="401" type="button">'
                + '        <span class="buttonText">Pin them!</span>'
                + '      </button>'
                + '      <button class="Module Button btn rounded multiPinCancelButton hasText" data-element-type="404" type="button">'
                + '        <span class="buttonText">' + P._('Cancel') + '</span>'
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

  preInitialize: function() {
    MultiPin.initPushState();
    MultiPin.initialize();
  },

  initialize: function() {
    if (MultiPin.isInitializable() && ! MultiPin.isInitialized()) {
      MultiPin.cacheBoardIds();
      MultiPin.injectButton();
      MultiPin.injectPinWrapper('.Pin');
      MultiPin.initInfiniteScrollListener();
      MultiPin.clear();
    }
  },

  buttonToClone: function() {
    return $('.movePinsButton,.boardFollowUnfollowButton');
  },

  isInitializable: function() {
    return (MultiPin.buttonToClone().length > 0);
  },

  isInitialized: function() {
    return ($('.multiPinButton').length > 0);
  },

  isInitializablePath: function(path) {
    if (path === '/') { return false; }
    else if (path.indexOf('/pin') === 0) { return false; }
    else if (/^\/.*\/.*\/$/.test(path)) { return true; } // path: /username/board/
    else if (/^\/.*\/$/.test(path)) { return false; } // path: /username/
    else { console.warn('MultiPin: Unknown Path', path); return false; }
  },

  // Implement an onpushstate event
  // http://stackoverflow.com/questions/4570093
  initPushState: function() {
    if (history.onpushstate === MultiPin.initialize) { return; }

    (function(history){
      var pushState = history.pushState;
      history.pushState = function(state) {
        if (typeof history.onpushstate == "function") {
            history.onpushstate({state: state});
        }
        return pushState.apply(history, arguments);
      }
    })(window.history);

    history.onpushstate = function() {
      window.setTimeout(function() {
        if (MultiPin.isInitializablePath(window.location.pathname));
          MultiPin.waitUntilInitializable = setInterval(function() {
            if (MultiPin.isInitializable()) {
              clearInterval(MultiPin.waitUntilInitializable);
              MultiPin.initInfiniteScrollListener();
              MultiPin.initialize();
            }
          }, 50);
      }, 50);
    }
  },

  injectButton: function() {
    $(this.buttonToClone()[0]).before(this.buttonHtml);
    this.multiPinButton = $('.multiPinButton');
    this.multiPinButton.click(this.toggleMultiPinning);
  },

  injectPinWrapper: function(parentElem) {
    var parentElem = $(parentElem);
    
    if (parentElem.find('.multiPinPinWrapper').length === 0) {
      parentElem.find('.pinWrapper').prepend(MultiPin.pinWrapperHtml);
      parentElem.find('.pinWrapper').click(function(e) { MultiPin.togglePin(e.currentTarget); });
    }

    if (MultiPin.isMultiPinning())
      MultiPin.showCheckboxes();
  },

  selectedPins: {},

  togglePin: function(clickedElem) {
    if (! MultiPin.isMultiPinning()) { return; }
    var pinElem = $(clickedElem).parents('.Pin');
    var attributes = MultiPin.getPinAttributes(pinElem);

    if (MultiPin.selectedPins[attributes.pinId]) {
      pinElem.find('.multiPinCheckbox').removeClass('selected');
      delete MultiPin.selectedPins[attributes.pinId];
    } else {
      pinElem.find('.multiPinCheckbox').addClass('selected');
      MultiPin.selectedPins[attributes.pinId] = attributes;
    }

    MultiPin.updateSelectedCount();
  },

  updateSelectedCount: function() {
    var count = Object.keys(MultiPin.selectedPins).length;

    if (count === 0)
      var text = $(P._("<span class='label'>Select some Pins!</span>")).text();
    if (count === 1)
      var text = '1 Pin ' + P._('Selected');
    if (count > 1)
      var text = count + ' Pins ' + P._('Selected');

    $('.PinCount .label').text(text);
  },

  isMultiPinning: function() {
    return ($('.Module.MultiPinBar').length > 0);
  },

  // http://davidwalsh.name/detect-node-insertion
  initInfiniteScrollListener: function() {
    var insertListener = function(e){
      if (e.animationName === 'nodeInserted') {
        if (! MultiPin.isInitialized())
          MultiPin.initialize();
        MultiPin.injectPinWrapper(e.target);
      }
    };

    document.addEventListener('animationstart', insertListener, false);
    document.addEventListener('webkitAnimationStart', insertListener, false);
  },

  toggleMultiPinning: function() {
    if (MultiPin.isMultiPinning()) {
      MultiPin.hideBar();
      MultiPin.hideCheckboxes();
    } else {
      MultiPin.showBar();
      MultiPin.showCheckboxes();
    }
  },

  showBar: function() {
    $('.Module.BoardInfoBar').append(MultiPin.barHtml);
    $('.smallBoardName').css('display', 'none');
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
    $('.smallBoardName').css('display', 'block');
  },

  showCheckboxes: function() {
    $('.Pin').addClass('multiPinMode');
  },

  hideCheckboxes: function() {
    $('.Pin').removeClass('multiPinMode');
    $('.multiPinCheckbox').removeClass('selected');
  },

  getPinAttributes: function(elem) {
    return {
      description: MultiPin.trim($(elem).find('.pinDescription').text()),
      pinId: MultiPin.trim($(elem).find('a.pinImageWrapper').attr('href').replace('/pin/', '').replace('/', '')),
      sourceUrl: window.location.pathname
    };
  },

  pinThem: function() {
    var count = Object.keys(MultiPin.selectedPins).length;
    if (count === 0) { P.showError(P._('Select some Pins first.')); return; }

    if (count === 1)
      var title = '1 Pin ' + P._('Selected');
    if (count > 1)
      var title = count + ' Pins ' + P._('Selected');

    MultiPin.showBoardPicker(title, function(board) {
      var boardId = MultiPin.getBoardIdfromName(board);

      MultiPin.startProgress('Pinning ' + count + ' pins...');

      $.each(MultiPin.selectedPins, function(pinId) {
        var attributes = MultiPin.selectedPins[pinId];
        attributes.boardId = boardId;
        MultiPin.pinIt(attributes);
      });

    });
  },

  pinIt: function(options) {
    MultiPin.requests.push(options);

    jQuery.ajax('https://www.pinterest.com/resource/RepinResource/create/', {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-APP-VERSION': P.CONTEXT.app_version,
        'X-CSRFToken': P.csrf.getCSRFToken(),
        'X-NEW-APP': 1,
        'X-Pinterest-AppState': 'active'
      },
      method: 'POST',
      data: {
        source_url: options.sourceUrl,
        data: JSON.stringify({
          'options': {
            'board_id': options.boardId,
            'description': options.description,
            'link': options.link,
            'pin_id': options.pinId
          }
        }),
        'context': {}
      },
      success: function() { MultiPin.requestsSuccess.push(options); },
      error: function() { MultiPin.requestsError.push(options); console.warn('MultiPin: Error', options); },
    });
  },

  // TODO: Oh my.
  cacheBoardIds: function() {
    var boards = {};
    var js = $('#jsInit').html();

    js = js.substr( js.indexOf('"all_boards"'));
    js = js.substr( 0, js.indexOf('}]') + 2);
    js = '{' + js + '}';
    
    try {
      js = JSON.parse(js);
    } catch(e) {
      { m = "Couldn't understand list of boards"; P.showError(P._(m)); throw e; }
    }

    if (typeof js.all_boards === 'undefined')
      { e = "Couldn't find list of boards. "; P.showError(P._(e)); throw e; }

    js.all_boards.forEach(function(board) {
      boards[board.name] = board.id;
    });

    MultiPin.boards = boards;
  },

  getBoardIdfromName: function(name) {
    var id = MultiPin.boards[name];

    if ((Object.keys(MultiPin.boards).length === 0) || (typeof id === 'undefined'))
      { e = "Sorry! Multi Pin doesn't work if you just created a new board. Please refresh this page and try again."; P.showError(P._(e)); throw e; }

    return id;
  },

  showBoardPicker: function(title, callback) {
    P.loadModule({
      name: 'PinForm'
    }).then(function (module) {
      P.getModalManager().showInModal(module);

      var uglyHack = setInterval(function() {
        if ($('.PinForm').length === 0) { return; }

        clearInterval(uglyHack);

        $('.PinForm .pinFormHeader').text(title);
        $('.PinForm .savePinButton').text('Pin Them!');
        $('.PinForm li.boardWrapper').siblings().remove()
        $('.PinForm .socialShareWrapper').remove();
        $('.PinForm .ui-PinPreview').remove();

        $('.PinForm .savePinButton').click(function(e) {
          e.preventDefault();
          var board = MultiPin.trim($('.PinForm .BoardPickerDropdownButton .nameAndIcons').text());
          callback(board);
        });
      }, 10);
    }.bind(this));
  },

  startProgress: function(status) {
    $('.PinForm .savePinButton').addClass('disabled').text('Pinning...');
    $('.PinForm').addClass('ConfirmDialog');
    $('.PinForm ul').replaceWith('<p class="body multiPinStatus">' + status + '</p>');
    MultiPin.updateProgress(status);

    MultiPin.progressPoll = setInterval(function() {
      var all = MultiPin.requests.length;
      var success = MultiPin.requestsSuccess.length;
      var error = MultiPin.requestsError.length;

      if (success === all) {
        var status = 'Yay! Pinned ' + success + ' Pins';
        MultiPin.finishProgress(true);
      } else if ((success + error) === all && error > 0) {
        var status = "Oops! Something happened and I couldn't pin " + error + " Pins";
        MultiPin.finishProgress(false);
      } else if (success === 0) {
        var status = 'Pinning ' + all + ' Pins...';
      } else {
        var status = 'Pinning ' + success + ' of ' + all + ' Pins...';
      }

      MultiPin.updateProgress(status);
    }, 20);
  },

  finishProgress: function(success) {
    // TODO: if current path is target board then refresh
    clearInterval(MultiPin.progressPoll);

    MultiPin.clear();

    $('.PinForm .savePinButton').off().removeClass('disabled').text(P._('Okay')).click(function() {
      MultiPin.dismissBoardPicker();
      if (success)
        MultiPin.toggleMultiPinning();
    });
  },

  dismissBoardPicker: function() {
    $('.PinForm .cancelButton').trigger('click');
  },

  updateProgress: function(status) {
    $('.multiPinStatus').text(status);
  },

  clear: function() {
    MultiPin.selectedPins = {};
    MultiPin.requests = [];
    MultiPin.requestsSuccess = [];
    MultiPin.requestsError = [];
  },

  trim: function(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');    
  }

};

MultiPin.preInitialize();

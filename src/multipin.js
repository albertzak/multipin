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
      console.log('MultiPin: Initializing');
      MultiPin.injectButton();
      MultiPin.injectPinWrapper('.Pin');
      MultiPin.initInfiniteScrollListener();
      MultiPin.clearRequests();
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
    
    if (! parentElem.children('.multiPinPinWrapper').length > 0) {
      parentElem.children('.pinWrapper').prepend(MultiPin.pinWrapperHtml);
      parentElem.children('.pinWrapper').click(function(e) {
        if (MultiPin.isMultiPinning()) {
          $(e.currentTarget).find('.multiPinCheckbox').toggleClass('selected');
          MultiPin.updateSelectedCount();
        }
      });
    }

    if (MultiPin.isMultiPinning())
      MultiPin.showCheckboxes();
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

  updateSelectedCount: function() {
    var count = $('.multiPinCheckbox.selected').length;

    if (count === 0)
      var text = $(P._("<span class='label'>Select some Pins!</span>")).text();
    if (count === 1)
      var text = '1 Pin ' + P._('Selected');
    if (count > 1)
      var text = count + ' Pins ' + P._('Selected');

    if (count > 50)
      P.showError(P._("You can only move 50 Pins at a time."));

    $('.PinCount .label').text(text);
  },

  isMultiPinning: function() {
    return ($('.Module.MultiPinBar').length > 0);
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

  pinThem: function() {
    var count = $('.multiPinCheckbox.selected').length;
    if (count === 0) { P.showError(P._('Select some Pins first.')); return; }
    if (count > 50)  { P.showError(P._('You can only move 50 Pins at a time.')); return; };

    if (count === 1)
      var title = '1 Pin ' + P._('Selected');
    if (count > 1)
      var title = count + ' Pins ' + P._('Selected');

    MultiPin.showBoardPicker(title, function(board) {
      var boardId = MultiPin.getBoardIdfromName(board);

      MultiPin.startProgress('Pinning ' + count + ' pins...');

      $('.multiPinCheckbox.selected').each(function(i, el) {
        var pinElement = $(el).parents('.Pin');

        var options = {
          description: MultiPin.trim(pinElement.find('.pinDescription').text()),
          pinId: MultiPin.trim(pinElement.find('a.pinImageWrapper').attr('href').replace('/pin/', '').replace('/', '')),
          boardId: boardId,
          sourceUrl: window.location.pathname,
        };

        MultiPin.pinIt(options);
      });

    });
  },

  clearRequests: function() {
    MultiPin.requests = [];
    MultiPin.requestsSuccess = [];
    MultiPin.requestsError = [];
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
      error: function() { MultiPin.requestsError.push(options); console.log('MultiPin: Error', options); },
    });
  },

  getBoardIdfromName: function(name) {
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
      { e = "Couldn't find list of boards"; P.showError(P._(e)); throw e; }

    if (js.all_boards.length === 0)
      { e = "You don't have any boards"; P.showError(P._(e)); throw e; }

    js.all_boards.forEach(function(board) {
      boards[board.name] = board.id;
    });

    var id = boards[name];

    if (typeof id === 'undefined')
      { e = "Couldn't find board"; P.showError(P._(e)); throw e; }

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

    MultiPin.clearRequests();

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

  trim: function(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');    
  }

};

MultiPin.preInitialize();

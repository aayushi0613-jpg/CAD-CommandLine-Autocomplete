//
//
//

var XeCFxCommandLine = function () {
    "use strict";

    var self = this;

    var m_commandList = [];
    var m_sysVarList = [];
    var m_aliasesList = [];
    var m_commonList = [];
    var m_currentFocus = -1;
    var m_enterNavIndex;
    var m_lineEdit = null;
    var m_bAddAliases = true;
    var m_bAddMidStr = true;
    var m_bAddSysVar = true;
    var m_bShowSuggList = true;
    var m_activeItem;
    var m_midStrRange = 3;
    var m_inputValue = "";
    var m_bAutoSuggestion = true;
    var autoComplete;
    var keyCode;
    var m_delayMiliSec = 400;
    var m_aliasesWithCmd = true;
    var isBackSpace = false;
    var ignore_ = false;
    let ignoreLen = 0;


    self.getLineEditId = function () {
        return m_LineEditId;
    };

    self.updateSuggestionPopupList = function () {
        //On demand call for command list
        if (!window.IsOsVersion()) {
            const p1 = window.m_XeApplication.RequestAliasesList();
            const p2 = window.m_XeApplication.RequestCommandList();
            const p3 = window.m_XeApplication.RequestSysVarList();

            Promise.all([p1, p2, p3]).then((values) => {
                m_aliasesList = values[0];
                m_commandList = values[1];
                m_sysVarList = values[2];
                self.prepareList();
            });
        }
    };

    self.setLineEditId = function (id) {
        m_LineEditId = id;
        
        m_lineEdit  = document.getElementById(m_LineEditId);

        if (m_lineEdit) {
            self.updateSuggestionPopupList();
            m_lineEdit.addEventListener("input", self.input);

            // ad hoc for a command line
            m_lineEdit.onkeydown = function (e) {

                keyCode = e.keyCode;

                let doc = window.getXeActiveDocument();
                var xeimp = doc.getXeInputPointManager();
                var bOnshape = window.IsOsVersion();
                var bViewMode = doc.getViewMode();

                var parentDiv = document.getElementById(this.id + "autocomplete-list");
                if (parentDiv)
                {
                    parentDiv = parentDiv.getElementsByTagName("div");
                }
                else
                {
                    m_currentFocus = -1;
                }

                if (e.ctrlKey && e.code === "KeyZ") {
                    undo_redo_operations(e, this, '_U');
                } else if (e.ctrlKey && e.code === "KeyS") {
                    e.preventDefault();
                } else if (e.ctrlKey && e.code === "KeyO") {
                    e.preventDefault();
                } else if (e.ctrlKey && e.code === "KeyY") {
                    undo_redo_operations(e, this, '_Redo');
                } else if (e.ctrlKey && (e.code === "F8" || e.code === "F3" || e.code === "F7" || e.code === "F11" || e.code === "F10")) {
                    m_currentFocus = -1;
                } else {
                    switch (e.keyCode) { // ad hoc for XENON-16908
                        case 27: // esc

                            var m_lineEdit = document.getElementById(m_LineEditId);

                            if (m_lineEdit)
                                m_lineEdit.value = "";

                            closeAllLists();
                            m_currentFocus = -1;
                            m_enterNavIndex = -1;

                            break;
                        case 13: // enter
                        case 32: // space

                            xeimp.m_bClientPending = true;

                            if (xeimp.m_ClearClientPendingStateTimeout)
                                clearTimeout(xeimp.m_ClearClientPendingStateTimeout);

                            xeimp.m_ClearClientPendingStateTimeout = setTimeout(xeimp.ClearClientPendingState, 750, xeimp);

                            if (m_enterNavIndex > -1 && !bOnshape) {  //send Click event on EnterPress on any item from autocomplete list.
                                if (parentDiv && parentDiv.length > 0) {

                                    if (!m_lineEdit)
                                        m_lineEdit = document.getElementById(m_LineEditId);

                                    if (!isBackSpace)
                                        m_lineEdit.value = parentDiv[m_enterNavIndex].innerText.split(" ")[0];
                                    if (m_lineEdit.setSelectionRange) //To handle auto suggestion on enter press 
                                        m_lineEdit.setSelectionRange(m_lineEdit.value.length, m_lineEdit.value.length);
                                }
                                
                                closeAllLists();
                            }
                            m_currentFocus = -1;
                            m_enterNavIndex = -1;

                            break;
                        case 46:
                            if (!bViewMode) {
                                let input_edit = document.getElementById(m_LineEditId);

                                if (input_edit.value == "") {
                                    let sset = window.getXeActiveDocument().getXeMainSelectionSet().getHandles();

                                    if (sset.length > 0) {

                                        window.getXeActiveDocument().cmdERASE();
                                    }
                                }
                            }
                            break;
                        case 40:
                            if (!bOnshape) {
                                m_currentFocus++;
                                m_enterNavIndex = m_currentFocus;
                                addActive(parentDiv, true);
                            }
                            break;
                        case 38:
                            if (!bOnshape) {
                                m_currentFocus--;
                                m_enterNavIndex = m_currentFocus;
                                addActive(parentDiv, true);
                            }
                            break;
                        default:
                            break;
                    }
                }

                e.xeCustomEvent = true;
                e.xeWidgetId = m_DivId;

                e.stopPropagation();
                if (m_currentFocus < 0)
                    xeimp.getInputPointManager().updateInput(e);
            };

            m_lineEdit.onkeypress = function (e) {
                let doc = window.getXeActiveDocument();
                let ipm = doc.getXeInputPointManager().getInputPointManager();
                if (ipm) {
                    e.xeCustomEvent = true;
                    e.xeWidgetId = m_DivId;
                    e.stopPropagation();
                    //ipm.updateInput(e);
                }
            };

            m_lineEdit.onkeyup = function (e) {
                let doc = window.getXeActiveDocument();
                let ipm = doc.getXeInputPointManager().getInputPointManager();
                if (ipm) {
                    e.xeCustomEvent = true;
                    e.xeWidgetId = m_DivId;
                    e.stopPropagation();
                    ipm.updateInput(e);
                }
            };

            m_lineEdit.oncopy = function (event) {

                copy_cut_operations(event, this, "CTRL+C");
            };

            m_lineEdit.oncut = function (event) {

                copy_cut_operations(event, this, "CTRL+X");
            };

            m_lineEdit.onpaste = function (event) {

                var text = event.clipboardData.getData('text/plain');

                if (!text) {

                    var _data = window.CXeShortcutsManager.shortcuts["CTRL+V"];

                    if (_data) {

                        if (event.stopPropagation)
                            event.stopPropagation();
                        event.preventDefault();

                        window.CFxUI.fire(_data);
                    }
                }
            };
        }

    };

    function undo_redo_operations(event, element, cmd) {
        if (element)
            element.value = "";

        if (event.stopPropagation)
            event.stopPropagation();
        event.preventDefault();

        closeAllLists();

        let strCmd = "^C^C" + cmd;
        window.getXeActiveDocument().RunCmd(strCmd);
    }

    function copy_cut_operations(event, element, keySequence) {

        if ((element.selectionEnd - element.selectionStart) === 0) {

            var _data = window.CXeShortcutsManager.shortcuts[keySequence];

            if (_data) {

                event.clipboardData.setData("text/plain", "");

                if (event.stopPropagation)
                    event.stopPropagation();
                event.preventDefault();

                window.CFxUI.fire(_data);
            }
        }
    }

    function addActive(div, bSetValue) {
        if (!div) return false;
        removeActive(div);
        if (m_currentFocus >= div.length) {
            m_currentFocus = 0;
        } else if (m_currentFocus < 0) {
            m_currentFocus = (div.length - 1);
        }
        if (div[m_currentFocus])
        {
            div[m_currentFocus].classList.add("autocomplete-active");

            if (div[m_currentFocus].scrollIntoViewIfNeeded)
                div[m_currentFocus].scrollIntoViewIfNeeded(false);
            else
                div[m_currentFocus].scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });

            if (bSetValue /*&& m_lineEdit.value.length >= 3*/) {
                if (ignore_) {
                    if (m_lineEdit.value.length >= 2)
                        m_lineEdit.value = "_" + div[m_currentFocus].innerText.split(" ")[0];
                }
                else
                    m_lineEdit.value = div[m_currentFocus].innerText.split(" ")[0];
            }
            div[m_currentFocus].focus();
            if (m_lineEdit.setSelectionRange) {
                m_lineEdit.focus();
                var len = m_lineEdit.value.length;
                if (m_bAutoSuggestion && m_inputValue)
                    m_lineEdit.setSelectionRange((m_inputValue.length + ignoreLen), len);
                else
                    m_lineEdit.setSelectionRange(len, 2 * len);
            }
        }
    }

    function removeActive(div) {
        for (var i = 0; i < div.length; i++) {
            div[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists() {
        var div = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < div.length; i++) {
            div[i].parentNode.removeChild(div[i]);
        }
    }

    self.updateCommandLine = function ( isCommandRunning ) {
        let trimbleStatusBar = document.getElementsByClassName( "XeSheetControlGroupTrimble" );
        if ( trimbleStatusBar.length == 0 ) {
            return;
        }
        let commandLinePrefix = document.querySelector( '[data-object-name="CommandLinePrompt"]' );
        if ( m_lineEdit == null || commandLinePrefix == null ) {
            return;
        }
        else if ( isCommandRunning === true || commandLinePrefix.innerText.length !== 0 ) {
            if ( !( window.CFxUI.css_helper.hasStyleClass( m_lineEdit, "activated" ) ) ) {
                window.CFxUI.css_helper.removeStyleClass( m_lineEdit, "inactive" );
                window.CFxUI.css_helper.addStyleClass( m_lineEdit, "activated" );
            }
        }
        else if ( m_lineEdit.value.length === 0
            && window.CFxUI.css_helper.hasStyleClass( m_lineEdit, "activated" ) ) {
            window.CFxUI.css_helper.removeStyleClass( m_lineEdit, "activated" );
            if ( !( window.CFxUI.css_helper.hasStyleClass( m_lineEdit, "inactive" ) ) ) {
                window.CFxUI.css_helper.addStyleClass( m_lineEdit, "inactive" );
            }
        }
    };

    function closeTrimbleSheetPopup( e )
    {
        let trimbleSheetMgr = document.querySelector( '[data-object-name="CXeTrSheetWidget"]' );
        if ( trimbleSheetMgr == null ) {
            return;
        }

        let elements = [ ...document.querySelectorAll( '[data-object-name="Model"]' ) ].concat( [ ...document.querySelectorAll( '[data-object-name="layers_menu"]' ) ] );
        let elementsIds = elements.map( x => x.id );
        if ( e.target == null )
            return;
        let target = e.target.id;
        if ( e.target.parentElement == null )
            return;
        let parentElement = e.target.parentElement.id;
        for ( let i = 0; i < elementsIds.length; i++ )
            if ( elementsIds[ i ] === target || elementsIds[ i ] === parentElement ) {
                return;
            }
        trimbleSheetMgr.style.display = "none";
        document.querySelector( '[data-object-name="layers_menu"]' ).classList.remove( "active" );
        Wt.emit( trimbleSheetMgr, 'hidePopup' );
    }

    self.dragElement = function (cwId, handleId) {
        var pos1 = 0, pos2 =0, pos3 = 0, pos4 = 0;
        var commandWindow = document.getElementById(cwId);
        var handle = document.getElementById(handleId);
        commandWindow.style.position = "relative";
        commandWindow.style.bottom = 68 + "px";
        commandWindow.style.left = null;
        commandWindow.style.top = null;
        if (handle) {
            /* if present, the header is where you move the DIV from:*/
            handle.onmousedown = dragMouseDown;
        } else {
            /* otherwise, move the DIV from anywhere inside the DIV:*/
            commandWindow.onmousedown = dragMouseDown;
        }

        window.addEventListener('resize', onResize, false);

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            //Adding temporary canvas under CMD window when draging CMD window to sync the events.
            var docManager = document.getElementsByClassName("no-focus-border");
            var canvas = document.createElement('canvas');
            canvas.setAttribute('class', 'CmdTempDiv');
            canvas.width = docManager[0].wtWidth;
            canvas.height = docManager[0].wtHeight;
            canvas.style.position = 'absolute';
            docManager[0].appendChild(canvas);

            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            if (e.clientX < 0 || e.clientY < 0 || e.clientX > window.innerWidth || e.clientY > window.innerHeight)
                return;
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            commandWindow.style.top = (commandWindow.offsetTop - pos2) + "px";
            commandWindow.style.left = (commandWindow.offsetLeft - pos1) + "px";
            commandWindow.style.bottom = null;
            commandWindow.style.position = "absolute";
        }

        function onResize(e) {
            commandWindow.style.position = "relative";
            commandWindow.style.bottom = 68 + "px";
            commandWindow.style.left = null;
            commandWindow.style.top = null;
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
            $('.CmdTempDiv').remove(); // delete temp Div under CMD window
        }
    };

    self.input = function (event) {
        clearTimeout(autoComplete);
        if (!m_lineEdit)
            m_lineEdit = document.getElementById(m_LineEditId);
        var parentDiv, i, val = m_lineEdit.value, startWithList = [], exactMatch = [], midStringList = [], list = [], autoSuggestion = true;
        closeAllLists();
        var IsInsideCommand = window.getXeActiveDocument().getXeInputPointManager().getInsideCommand();
        if ( !val || val.indexOf( " ", 0 ) !== -1 || IsInsideCommand ) { return false; }

        self.updateCommandLine();
        parentDiv = document.createElement("DIV");
        parentDiv.setAttribute("id", m_lineEdit.id + "autocomplete-list");
        parentDiv.setAttribute("class", "autocomplete-items");
        m_lineEdit.parentNode.prepend(parentDiv);
        m_commonList.forEach((element, i) => {
            var strToMatch = element.split(" ")[0];

            if ( m_bAddAliases && !m_aliasesWithCmd) {
                element = strToMatch;
            }
            if (strToMatch === val.toUpperCase()) {
                exactMatch.push(element);
            }
            else if (strToMatch.substr(0, val.length) === val.toUpperCase() || (m_bAddMidStr && (val.length >= m_midStrRange && strToMatch.startsWith("-") && strToMatch.substr(1, val.length) === val.toUpperCase()))) {
                startWithList.push(element);
            }
            else if ((!strToMatch.startsWith("_")) && (m_bAddMidStr && (val.length >= m_midStrRange && strToMatch.indexOf(val.toUpperCase(), 0) !== -1))) {
                midStringList.push(element);
            }
        });
        if (startWithList.length <= 0 && exactMatch.length <= 0) {
            autoSuggestion = false;
        }
        startWithList.sort(function (str1, str2) {
            var a = str1.indexOf(val.toUpperCase(), 0);
            var b = str2.indexOf(val.toUpperCase(), 0);
            return a - b;
        });
        midStringList.sort();
        list = [...exactMatch, ...startWithList, ...midStringList];

        self.createAutoSuggList(list, val, parentDiv);
        //setTimeout(self.createAutoSuggList, m_delayMiliSec, list, val, parentDiv);

        if (!m_bShowSuggList)
            parentDiv.style.display = "none";

        m_inputValue = val;
        m_currentFocus = 0;
        isBackSpace = false;
        m_enterNavIndex = m_currentFocus;
        if (window.XeUtils.UserAgentDetector.browser === "Microsoft Internet Explorer" || window.XeUtils.UserAgentDetector.browser === "Microsoft Edge") {
            if (keyCode && keyCode === 8)
                addActive(parentDiv.getElementsByTagName("div"));
            else
                addActive(parentDiv.getElementsByTagName("div"), (autoSuggestion && m_bAutoSuggestion));
        }
        else {
            if (event && event.inputType === "deleteContentBackward") {
                addActive(parentDiv.getElementsByTagName("div"));
                isBackSpace = true;
            }
            else {
                addActive(parentDiv.getElementsByTagName("div"), (autoSuggestion && m_bAutoSuggestion));
            }
        }
    };

    document.addEventListener("click", function (e) {
        closeAllLists();

        self.updateCommandLine();

        closeTrimbleSheetPopup(e);
        self.hideContextMenu();
    });

    self.createAutoSuggList = function (list, val, parentDiv)
    {
        list.forEach((element, i) => {
            var itemDiv = document.createElement("DIV");
            var bSysVar = m_sysVarList.includes(element);
            var bCmd = m_commandList.includes(element);
            if (bCmd) {
                itemDiv.innerHTML = "<strong style='pointer-events:none'>" + list[i].substr(0, val.length);
                itemDiv.innerHTML += "<strong style='pointer-events:none'>" + list[i].substr(val.length);
                itemDiv.innerHTML += "<input type='hidden' value='" + list[i] + "'>";
            }
            else if (bSysVar) {
                itemDiv.innerHTML = "<i style='pointer-events:none'>" + list[i].substr(0, val.length) + "</strong>";
                itemDiv.innerHTML += "<i style='pointer-events:none'>" + list[i].substr(val.length);
                itemDiv.innerHTML += "<input type='hidden' value='" + list[i] + "'>";
            }
            else {
                itemDiv.innerHTML = list[i].substr(0, val.length);
                itemDiv.innerHTML += list[i].substr(val.length);
                itemDiv.innerHTML += "<input type='hidden' value='" + list[i] + "'>";
            }
            itemDiv.addEventListener("click", function (e) {
                e.stopPropagation();
                var strCmd = itemDiv.getElementsByTagName("input")[0].value.split(" ")[0];
                strCmd = "^C^C" + strCmd;
                window.getXeActiveDocument().RunCmd(strCmd);
                closeAllLists();
            });
            itemDiv.addEventListener("mousemove", onMouseMove, false);
            itemDiv.addEventListener('contextmenu', createContextMenu, false);
            parentDiv.appendChild(itemDiv);
        });
    };

    function onMouseMove(e) {
        var parentDiv = document.getElementById(self.getLineEditId() + "autocomplete-list");
        if (parentDiv) {
            parentDiv = parentDiv.children;
            var hoverActive = Array.prototype.indexOf.call(parentDiv, e.currentTarget);
            if (hoverActive !== m_currentFocus) {
                e.stopPropagation();
                e.preventDefault();
                m_activeItem = e.target;
                m_currentFocus = hoverActive;
                if (parentDiv[hoverActive] && parentDiv[hoverActive].classList) {
                    removeActive(parentDiv);
                    parentDiv[hoverActive].classList.add("autocomplete-active");
                }
            }
        }
    }

    function onOptionMenu(e) {
        var docWidgetElem = jQuery('#' + m_DivId)[0];
        e.stopPropagation();
        switch (e.target.dataset.itemId) {
            case 'FxCommandLine_AutoSuggestion':
                m_bAutoSuggestion = !m_bAutoSuggestion;
                Wt.emit(docWidgetElem, 'SetAutoComPref', '_AUTO', m_bAutoSuggestion);
                break;
            case 'FxCommandLine_IncludeAliases':
                m_bAddAliases = !m_bAddAliases;
                Wt.emit(docWidgetElem, 'SetAutoComPref', '_Aliases', m_bAddAliases);
                break;
            case 'FxCommandLine_IncludeMidstringSearch':
                m_bAddMidStr = !m_bAddMidStr;
                Wt.emit(docWidgetElem, 'SetAutoComPref', '_MIDSTRING', m_bAddMidStr);
                break;
            case 'FxCommandLine_IncludeSystemVariables':
                m_bAddSysVar = !m_bAddSysVar;
                Wt.emit(docWidgetElem, 'SetAutoComPref', '_SYSTEM', m_bAddSysVar);
                break;
            case 'FxCommandLine_DisplaySuggestionList':
                window.getXeApplication().RequestLocalizedStringMap().then(function (localizedStringMap) {
                    if (localizedStringMap.hasOwnProperty('FxCommandLine_CloseSuggestionListTitle') && localizedStringMap.hasOwnProperty('FxCommandLine_CloseSuggestionListMessage')) {
                        Confirm(localizedStringMap['FxCommandLine_CloseSuggestionListTitle'],
                            localizedStringMap['FxCommandLine_CloseSuggestionListMessage'],
                            localizedStringMap['FxCommandLine_CloseSuggestionListYesOption'],
                            localizedStringMap['FxCommandLine_CloseSuggestionListNoOption']);
                    }
                });
                break;
            default:
                break;
        }

        self.hideContextMenu();
        self.prepareList();
        if (m_bShowSuggList)
            self.input();
    }

    function Confirm(title, msg, $true, $false) {
        var $content = "<div class='autocomplete dialog-ovelay'>" +
                        "<div class='dialog'><header>" +
                         " <h3> " + title + " </h3> " +
                         "<i class='fa fa-close'></i>" +
                     "</header>" +
                     "<div class='dialog-msg'>" +
                         " <p> " + msg + " </p> " +
                     "</div>" +
                     "<footer>" +
                         "<div class='controls'>" +
                             " <button class='button button-danger doAction'>" + $true + "</button> " +
                             " <button class='button button-default cancelAction'>" + $false + "</button> " +
                         "</div>" +
                     "</footer>" +
                  "</div>" +
                "</div>";
        $('body').prepend($content);
        $('.doAction').click(function () {
            let docWidgetElem = jQuery('#' + m_DivId)[0];
            self.toggleAutoSuggList(false);
            Wt.emit(docWidgetElem, 'SetAutoComPref', '_LIST', m_bShowSuggList);
            closeAllLists();
            $(this).parents('.dialog-ovelay').fadeOut(0, function () {
                $(this).remove();
            });
        });
        $('.cancelAction, .fa-close').click(function () {
            $(this).parents('.dialog-ovelay').fadeOut(0, function () {
                $(this).remove();
            });
        });
        $(document).ready(function () {
            $(".dialog").draggable({
                handle: "header"
            });
        });
    }

    function createContextMenu(e) {
        e.preventDefault();
        self.hideContextMenu();

        const menuParent = e.currentTarget;
        const menuLeft = e.clientX;
        const menuTop = e.clientY;

        window.getXeApplication().RequestLocalizedStringMap().then(function (localizedStringMap) {
            var menu, ul;
            var stringKeys = ['FxCommandLine_AutoSuggestion', 'FxCommandLine_IncludeAliases', 'FxCommandLine_IncludeMidstringSearch',
                'FxCommandLine_IncludeSystemVariables', 'FxCommandLine_DisplaySuggestionList'];

            menu = document.createElement("DIV");
            menu.setAttribute("class", "autocomplete-contextmenu");
            document.body.appendChild(menu);

            ul = document.createElement("ul");
            ul.setAttribute("class", "menu-options");
            ul.addEventListener('click', onOptionMenu, false);

            stringKeys.forEach(function (key) {
                if (!localizedStringMap.hasOwnProperty(key))
                    return;

                let name = localizedStringMap[key];

                let li, span;
                li = document.createElement("li");
                li.setAttribute("class", "menu-option");
                li.dataset.itemId = key;

                if (m_bAutoSuggestion && key === "FxCommandLine_AutoSuggestion")
                    li.setAttribute("class", "checked");
                else if (m_bAddAliases && key === "FxCommandLine_IncludeAliases")
                    li.setAttribute("class", "checked");
                else if (m_bAddMidStr && key === "FxCommandLine_IncludeMidstringSearch")
                    li.setAttribute("class", "checked");
                else if (m_bAddSysVar && key === "FxCommandLine_IncludeSystemVariables")
                    li.setAttribute("class", "checked");
                else if ( m_bShowSuggList && key === "FxCommandLine_DisplaySuggestionList") {
                    li.setAttribute("class", "checked");
                }

                span = document.createTextNode(name);

                li.appendChild(span);
                ul.appendChild(li);
            });

            menu.appendChild(ul);

            menu.style.left = menuLeft + "px";
            menu.style.top = menuTop + "px";
            menu.style.display = "block";
        });
    }

    self.hideContextMenu = function () {
        var div = document.getElementsByClassName("autocomplete-contextmenu");
        for (var i = 0; i < div.length; i++) {
            div[i].parentNode.removeChild(div[i]);
        }
    };

    self.toggleAutoSuggList = function (state) {
        m_bShowSuggList = state;
    };

    self.toggleAutoSuggestion = function (state) {
        m_bAutoSuggestion = state;
    };

    self.toggleAddSysVar = function (state) {
        m_bAddSysVar = state;
        self.prepareList();
    };

    self.toggleAddMidString = function (state) {
        m_bAddMidStr = state;
    };

    self.toggleAddAliases = function (state) {
        m_bAddAliases = state;
        self.prepareList();
    };

    self.toggleAddAliasesWithCmd = function (state) {
        m_aliasesWithCmd = state;
    };

    self.connectSetFocus = function (div_id) {
        m_DivId = div_id;
        var div = document.getElementById(m_DivId);
        div.focus = function () {

            const tableEditorTrackerData = window.XeActiveTrackers.TrackerData("CFxActiveCellGripTracker");
            if (tableEditorTrackerData) {
                return;
            }

            var m_lineEdit = document.getElementById(m_LineEditId);
            if (m_lineEdit) {
                m_lineEdit.focus();
                setTimeout(function () {
                    self.input();
                }, 500);
            }
        };
    };

    self.prepareList = function () {
        m_commonList = [];
        if (m_bAddAliases) {
            m_commonList.push(...m_aliasesList);
        }

        m_commonList.push(...m_commandList);

        if (m_bAddSysVar) {
            m_commonList.push(...m_sysVarList);
        }
        m_commonList.sort();
    };

    var m_LineEditId = null;
    var m_DivId = null;
};
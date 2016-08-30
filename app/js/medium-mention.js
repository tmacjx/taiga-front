var MentionExtension = MediumEditor.Extension.extend({
    name: 'mediumMention',
    init: function() {
        this.subscribe('editableKeyup', this.handleKeyup.bind(this));
    },
    handleKeyup: function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        var isSpace = code === MediumEditor.util.keyCode.SPACE;

        if (this.mentionPanel) {
            this.keyDownMentionPanel(e);
        }

        var moveKeys = [37, 38, 39, 40];

        if (moveKeys.indexOf(code) !== -1) {
            return;
        }

        this.selection = this.document.getSelection();

        if (!isSpace && this.selection.rangeCount === 1) {
            var endChar = this.selection.getRangeAt(0).startOffset;
            var textContent = this.selection.focusNode.textContent;

            this.word = this.getLastWord(textContent);
            textContent = textContent.substring(0, endChar);

            if (this.word.length > 1 && ['@', '#'].indexOf(this.word[0]) != -1) {
                this.wrap();
                this.showPanel();

                MediumEditor.selection.select(
                  this.document,
                  this.wordNode.firstChild,
                  this.word.length
                );

                return;
            }
        } else if (isSpace) {
            this.cancelMentionSpace();
        }

        this.hidePanel();
    },
    reset: function() {
        this.wordNode = null;
        this.word = null;
        this.selection = null;
    },
    cancelMentionSpace: function() {
        if (this.wordNode && this.wordNode.nextSibling) {
            this.wordNode.textContent = this.word;

            // var range = this.selection.getRangeAt(0).cloneRange();
            // var parentNode = range.startContainer.parentNode;

            var textNode = this.document.createTextNode('');
            textNode.textContent = '\u00A0';

            this.wordNode.parentNode.insertBefore(textNode, this.wordNode.nextSibling);
            MediumEditor.selection.select(this.document, textNode, 1);
        }

        this.reset();
    },
    wrap: function() {
        var range = this.selection.getRangeAt(0).cloneRange();

        if (!range.startContainer.parentNode.classList.contains('mention')) {
            this.wordNode = this.document.createElement('b');
            this.wordNode.classList.add('mention');

            range.setStart(range.startContainer, this.selection.getRangeAt(0).startOffset - this.word.length);
            range.surroundContents(this.wordNode);

            this.selection.removeAllRanges();
            this.selection.addRange(range);

            //move cursor to old position
            range.setStart(range.startContainer, range.endOffset);
            range.setStart(range.endContainer, range.endOffset);
            this.selection.removeAllRanges();
            this.selection.addRange(range);
        } else {
            this.wordNode = range.startContainer.parentNode;
        }
    },
    refreshPositionPanel: function() {
        var bound = this.wordNode.getBoundingClientRect();

        this.mentionPanel.style.top = this.window.pageYOffset + bound.bottom + 'px';
        this.mentionPanel.style.left = this.window.pageXOffset + bound.left + 'px';
    },
    selectMention: function(item) {
        var link = document.createElement('a');

        link.setAttribute('href', item.url);
        link.innerText = '#' + item.ref + '-' + item.subject;

        this.wordNode.parentNode.replaceChild(link, this.wordNode);
        this.wordNode = link;

        var textNode = this.document.createTextNode('');
        textNode.textContent = '\u00A0';

        this.wordNode.parentNode.insertBefore(textNode, this.wordNode.nextSibling);
        MediumEditor.selection.select(this.document, textNode, 1);

        this.hidePanel();
        this.reset();
    },
    showPanel: function() {
        if(document.querySelectorAll('.medium-editor-mention-panel').length) {
            this.refreshPositionPanel();
            this.getItems(this.word, this.renderPanel.bind(this));
            return;
        }

        var  el = this.document.createElement('div');
        el.classList.add('medium-editor-mention-panel');

        this.mentionPanel = el;
        this.getEditorOption('elementsContainer').appendChild(el);
        this.getItems(this.word, this.renderPanel.bind(this));
    },
    keyDownMentionPanel: function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        var active = this.mentionPanel.querySelector('.active');

        if(!active) {
            return;
        }

        if (code === MediumEditor.util.keyCode.ENTER) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent('click', true, false);

            active.dispatchEvent(event);

            return;
        }

        active.classList.remove('active');

        if (code === 38) {
            if(active.previousSibling) {
                active.previousSibling.classList.add('active');
            } else {
                active.parentNode.lastChild.classList.add('active');
            }
        } else if (code === 40) {
            if(active.nextSibling) {
                active.nextSibling.classList.add('active');
            } else {
                active.parentNode.firstChild.classList.add('active');
            }
        }
    },
    renderPanel: function(items) {
        this.mentionPanel.innerHTML = '';

        if (!items.length) return;

        var ul = this.document.createElement('ul');

        ul.classList.add('medium-mention');

        items.forEach(function(it) {
            var li = this.document.createElement('li');

            li.innerText = '#' + it.ref + ' - ' + it.subject;
            li.addEventListener('click', this.selectMention.bind(this, it));

            ul.appendChild(li);
        }.bind(this));

        ul.firstChild.classList.add('active');

        this.mentionPanel.appendChild(ul);
    },
    hidePanel: function() {
        if (this.mentionPanel) {
            this.mentionPanel.parentNode.removeChild(this.mentionPanel);
            this.mentionPanel = null;
        }
    },
    getLastWord: function(text) {
        var n = text.split(' ');
        return n[n.length - 1].trim();
    }
});

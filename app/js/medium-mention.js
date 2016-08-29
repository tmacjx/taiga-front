var MentionExtension = MediumEditor.Extension.extend({
    name: 'mediumMention',
    init: function() {
        this.subscribe('editableKeyup', this.handleKeyup.bind(this));
    },
    handleKeyup: function(e) {
        var code = e.keyCode ? e.keyCode : e.which;
        var isSpace = code === 32;

        this.selection = this.document.getSelection();

        if (!isSpace && this.selection.rangeCount === 1) {
            var endChar = this.selection.getRangeAt(0).startOffset;
            var textContent = this.selection.focusNode.textContent;
            this.word = this.getLastWord(textContent);

            textContent = textContent.substring(0, endChar);

            if (this.word.length > 1 && ['@', '#'].indexOf(this.word[0]) != -1) {
                this.wrap();
                this.showPanel();
                return;
            }
        } else {
            this.cancelMention();
        }

        this.hidePanel();
    },
    cancelMention: function() {
        if (this.wordNode) {
            console.log(this.wordNode);
            console.log(this.word);
            console.log("cancel");

            this.wordNode.textContent = this.word;

            var range = this.selection.getRangeAt(0).cloneRange();
            var parentNode = range.startContainer.parentNode;

            textNode = this.document.createTextNode('');
            textNode.textContent = ' ';

            console.log(this.wordNode.nextSibling);
            parentNode.insertBefore(textNode, this.wordNode.nextSibling);
        }
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
        }
    },
    showPanel: function() {
        //getBoundingClientRect
        console.log("show");
    },
    hidePanel: function() {
        console.log("hide");
    },
    getLastWord: function(text) {
        var n = text.split(' ');
        return n[n.length - 1];
    }
});

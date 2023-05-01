class Keyboard {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.ALL_KEYS = null;
    this.SYSTEM_KEYS = null;
    this.NORMAL_KEYS = null;
    this.textarea = null;
    this.keyboard = null;
    this.language = 'en';
    this.initKeyboard();
  }

  initKeyboard() {
    this.loadKeys().then(() => {
      this.renderKeyboard();
      document
        .getElementById('languagebutton')
        .addEventListener('click', this.changeLanguage.bind(this));
      document.addEventListener('keydown', this.keyDown.bind(this));
      document.addEventListener('keyup', this.keyUp.bind(this));
      document.addEventListener('visibilitychange', this.clearActive.bind(this));
      window.addEventListener('pagehide', this.clearActive.bind(this));
      if (localStorage.getItem('language') && localStorage.getItem('language') !== this.language) {
        this.changeLanguage();
      }
      this.SYSTEM_KEYS = this.ALL_KEYS.filter((el) => el.system).map((el) => el.code);
      this.NORMAL_KEYS = this.ALL_KEYS.filter((el) => !el.system).map((el) => el.code);
    });
  }

  clearActive() {
    Array.from(document.querySelectorAll('.key_active')).map((element) => element.classList.remove('key_active'));
  }

  keyDown(event) {
    event.preventDefault();
    this.textarea.focus();
    // console.log(event.code, 'down');
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      this.keyboard.classList.add('keyboard_shift');
    }
    const pressedKey = this.keyboard.querySelector(`button[data-id="${event.code}"]`);
    if (pressedKey) {
      pressedKey.classList.add('key_active');
    }
    this.printToTextArea(event.code);
  }

  keyUp(event) {
    // console.log(event.code, 'up');
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      this.keyboard.classList.remove('keyboard_shift');
    }
    const pressedKey = this.keyboard.querySelector(`button[data-id="${event.code}"]`);
    if (pressedKey) {
      pressedKey.classList.remove('key_active');
      if (
        (event.code === 'ControlLeft'
          && this.keyboard.querySelector('.key_active[data-id="AltLeft"]'))
        || (event.code === 'AltLeft'
          && this.keyboard.querySelector('.key_active[data-id="ControlLeft"]'))
      ) {
        this.changeLanguage();
      }
    }
  }

  async loadKeys() {
    try {
      const response = await fetch('js/keyboard.json');
      this.ALL_KEYS = await response.json();
    } catch (error) {
      throw new Error('Problems with JSON loading');
    }
  }

  renderKeyboard() {
    const keyboard = document.createElement('main');
    this.keyboard = keyboard;
    const lines = [];
    let currentLine = [];
    keyboard.className = 'keyboard';

    this.ALL_KEYS.forEach((key) => {
      const button = document.createElement('button');
      button.classList.add('key');
      if (key.style) {
        key.style.split(' ').map((style) => button.classList.add(style));
      }
      button.dataset.id = key.code;

      const mainSpan = document.createElement('span');
      mainSpan.classList.add('key__main');
      button.append(mainSpan);

      if (key.system) {
        mainSpan.classList.add('key_system');
        mainSpan.textContent = key.value;
      } else {
        mainSpan.classList.add('key_en');
        mainSpan.textContent = key.lang.en.mainValue;

        const secondSpan = document.createElement('span');
        secondSpan.className = 'key__little key_en';
        secondSpan.textContent = key.lang.en.secondValue;

        const mainSpanRu = document.createElement('span');
        mainSpanRu.className = 'key__main key_ru';
        mainSpanRu.textContent = key.lang.ru.mainValue;

        const secondSpanRu = document.createElement('span');
        secondSpanRu.className = 'key__little key_ru';
        secondSpanRu.textContent = key.lang.ru.secondValue;

        button.append(secondSpan, mainSpanRu, secondSpanRu);
      }

      currentLine.push(button);
      if (key.last) {
        lines.push(currentLine);
        currentLine = [];
      }
    });

    lines.forEach((buttons) => {
      const line = document.createElement('div');
      line.className = 'keyboard__line';
      line.append(...buttons);
      keyboard.append(line);
    });
    const textarea = document.createElement('textarea');
    textarea.className = 'textarea';
    this.textarea = textarea;

    const description = document.createElement('footer');
    description.className = 'description';
    description.innerHTML = 'Works in Ubuntu. Press left <strong>Ctrl</strong> + <strong>Alt</strong> on your real keyboard or click <button id="languagebutton">here</button> to change language.<br>Current language is <span class="language_en">English</span><span class="language_ru">Russian</span>.';

    this.parentElement.prepend(textarea, keyboard, description);
  }

  changeLanguage() {
    this.keyboard.classList.toggle('keyboard_ru');
    localStorage.setItem('language', this.keyboard.classList.contains('keyboard_ru') ? 'ru' : 'en');
    this.language = this.keyboard.classList.contains('keyboard_ru') ? 'ru' : 'en';
  }

  addChar(char, textareaText, selectionStart) {
    if (selectionStart >= 0 && selectionStart <= textareaText.length) {
      this.textarea.value = textareaText.slice(0, selectionStart)
        + char
        + textareaText.slice(selectionStart, textareaText.length);
      this.textarea.selectionStart = selectionStart + char.length;
      this.textarea.selectionEnd = selectionStart + char.length;
    } else {
      this.textarea.value += char;
    }
  }

  printToTextArea(code) {
    const keyMap = {
      Tab: '\t',
      Enter: '\n',
      Space: ' ',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
    };
    const { value: textareaText, selectionStart } = this.textarea;
    const activeKeys = Array.from(document.querySelectorAll('.key_active')).map(
      (element) => element.dataset.id,
    );
    if (this.NORMAL_KEYS.includes(code)) {
      const findKey = this.ALL_KEYS.filter((el) => el.code === code);
      const value = this.keyboard.classList.contains('keyboard_shift')
        ? 'secondValue'
        : 'mainValue';
      const char = findKey[0].lang[this.language][value];
      this.addChar(char, textareaText, selectionStart);
    } else if (code === 'Backspace') {
      if (selectionStart > 0 && selectionStart <= textareaText.length) {
        this.textarea.value = textareaText.slice(0, selectionStart - 1)
          + textareaText.slice(selectionStart, textareaText.length);
        this.textarea.selectionStart = selectionStart - 1;
        this.textarea.selectionEnd = selectionStart - 1;
      }
    } else if (code === 'Delete') {
      if (selectionStart >= 0 && selectionStart <= textareaText.length - 1) {
        this.textarea.value = textareaText.slice(0, selectionStart)
          + textareaText.slice(selectionStart + 1, textareaText.length);
        this.textarea.selectionStart = selectionStart;
        this.textarea.selectionEnd = selectionStart;
      }
    } else if (Object.keys(keyMap).includes(code)) {
      this.addChar(keyMap[code], textareaText, selectionStart);
    }

    /*
    const { value: textareaText, selectionStart } = this.textarea;
    const char = this.current.char;
    const code = this.current.code;
    const event = this.current.event;
    const isCtrlKey = event.ctrlKey;
    const isAltKey = event.altKey;
    const isCapsLockPressed = this.state.isCapsLockPressed;
    const isShiftLeftPressed = this.state.isShiftLeftPressed;
    const isShiftRightPressed = this.state.isShiftRightPressed;

    const handleSpecialKey = () => {
      if (code === "Backspace") {
        if (selectionStart > 0 && selectionStart <= text.length) {
          this.textarea.value = text.slice(0, selectionStart - 1) + text.slice(selectionStart, text.length);
          this.textarea.selectionStart = selectionStart - 1;
          this.textarea.selectionEnd = selectionStart - 1;
        }
      } else if (code === "Delete") {
        if (selectionStart >= 0 && selectionStart <= text.length - 1) {
          this.textarea.value = text.slice(0, selectionStart) + text.slice(selectionStart + 1, text.length);
          this.textarea.selectionStart = selectionStart;
          this.textarea.selectionEnd = selectionStart;
        }
      } else if (code === "Tab") {
        this.current.char = "    ";
        insertChar();
      } else if (code === "Enter") {
        this.current.char = "\n";
        insertChar();
      } else if (code === "CapsLock") {
        if (isCapsLockPressed && !event.repeat) {
          this.removeActiveState();
          this.state.isCapsLockPressed = false;
        } else {
          this.addActiveState();
          this.state.isCapsLockPressed = true;
        }
        this.toggleCase();
      } else if (code === "ShiftLeft") {
        if (!isShiftLeftPressed && !isShiftRightPressed) {
          this.addActiveState();
          this.state.isShiftLeftPressed = true;
          this.toggleCase();
        }
      } else if (code === "ShiftRight") {
        if (!isShiftRightPressed && !isShiftLeftPressed) {
          this.addActiveState();
          this.state.isShiftRightPressed = true;
          this.toggleCase();
        }
      }
    };

    const insertChar = () => {
      if (selectionStart >= 0 && selectionStart <= text.length) {
        this.textarea.value = text.slice(0, selectionStart) + char + text.slice(selectionStart, text.length);
        this.textarea.selectionStart = selectionStart + char.length;
        this.textarea.selectionEnd = selectionStart + char.length;
      } else {
        this.textarea.value += char;
      }
    };

    const handleRegularKey = () => {
      insertChar();
    };

    if (c.SPECIALS.includes(code)) {
      handleSpecialKey();
    } else {
      handleRegularKey();
    }
  */
  }
}

export { Keyboard };

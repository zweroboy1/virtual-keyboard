class Keyboard {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.ALL_KEYS = null;
    this.textarea = null;
    this.keyboard = null;
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
    });
  }

  clearActive() {
    Array.from(document.querySelectorAll('.key_active')).map((element) => element.classList.remove('key_active'));
  }

  keyDown(event) {
    event.preventDefault();
    this.textarea.focus();
    console.log(event.code, 'down');
    const pressedKey = this.keyboard.querySelector(`button[data-id="${event.code}"]`);
    if (pressedKey) {
      pressedKey.classList.add('key_active');
    }
  }

  keyUp(event) {
    console.log(event.code, 'up');
    const pressedKey = this.keyboard.querySelector(`button[data-id="${event.code}"]`);
    if (pressedKey) {
      pressedKey.classList.remove('key_active');
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
  }
}

export { Keyboard };

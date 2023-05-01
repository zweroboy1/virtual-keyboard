class Keyboard {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.ALL_KEYS = null;
    this.textarea = null;
    this.keyboard = null;
    this.loadKeys().then(() => {
      this.renderKeyboard();
    });
  }

  bindTextarea(textarea) {
    this.textarea = textarea;
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
      button.className = key.style === '' ? 'key' : `key ${key.style}`;

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
    description.innerHTML = 'Works in Ubuntu. Press left <strong>Shift</strong> + <strong>Alt</strong> on your real keyboard or click <button>here</button> to change language.<br>Current language is English.';

    this.parentElement.prepend(textarea, keyboard, description);
  }
}

export { Keyboard };

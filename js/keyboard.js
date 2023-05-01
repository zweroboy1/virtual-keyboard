class Keyboard {
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.ALL_KEYS = null;
    this.loadKeys().then(() => {
      this.renderKeyboard();
    });
  }

  async loadKeys() {
    try {
      const response = await fetch('js/keyboard.json');
      this.ALL_KEYS = await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  renderKeyboard() {
    const keyboard = document.createElement('main');
    const lines = [];
    let currentLine = [];
    keyboard.className = 'keyboard keyboard_shift keyboard_ru';

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
    this.parentElement.prepend(keyboard);
  }
}

export { Keyboard };

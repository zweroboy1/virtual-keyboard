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
      const response = await fetch('js/keyboard-en.json');
      this.ALL_KEYS = await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  renderKeyboard() {
    const keyboard = document.createElement('main');
    const lines = [];
    let currentLine = [];
    keyboard.className = 'keyboard';

    this.ALL_KEYS.forEach((key) => {
      const button = document.createElement('button');
      button.className = key.style === '' ? 'key' : `key ${key.style}`;
      const mainSpan = document.createElement('span');
      mainSpan.className = 'key__main';
      mainSpan.textContent = key.mainValue;
      const secondSpan = document.createElement('span');
      secondSpan.className = 'key__little';
      secondSpan.textContent = key.secondValue;
      button.append(mainSpan, secondSpan);
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

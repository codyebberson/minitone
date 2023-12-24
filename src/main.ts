import { SoundEditor } from './soundeditor.ts';
import './style.css';
import { WinBox } from './winbox.ts';

const root = document.getElementById('app') as HTMLDivElement;
root.innerHTML = `
  <div>
    <div>
      <button id="test" type="button">Test</button>
      <button id="sound" type="button">Sound</button>
    </div>
  </div>
`;

const testButton = root.querySelector('#test') as HTMLButtonElement;
testButton.addEventListener('click', () => {
  const winbox = new WinBox({
    title: 'Cody',
    x: 100,
    y: 100,
    width: 400,
    height: 400,
    children: {
      render(parent: HTMLElement): void {
        const div = document.createElement('div');
        div.innerHTML = 'Hello World';
        parent.appendChild(div);
      },
    },
  });
  winbox.render(document.body);
});

const soundButton = root.querySelector('#sound') as HTMLButtonElement;
soundButton.addEventListener('click', () => {
  const winbox = new WinBox({
    title: 'Sound Editor',
    x: 100,
    y: 100,
    width: 600,
    height: 500,
    children: new SoundEditor(),
  });
  winbox.render(document.body);
});

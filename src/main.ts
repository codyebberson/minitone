import { audioCtx } from './player.ts';
import workletUrl from './player.worklet.ts?url';
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
        // div.innerHTML = 'Hello World';
        div.innerHTML = `
        <div>
        <p>Hello World</p>
        <button id="registerWorklet" type="button">Register Worklet</button>
        <button id="playWorklet" type="button">Play Worklet</button>
        </div>`;
        parent.appendChild(div);

        let workletNode: AudioWorkletNode | undefined = undefined;
        // let receiverNode: AudioWorkletNode | undefined = undefined;

        const registerWorkletButton = div.querySelector('#registerWorklet') as HTMLButtonElement;
        registerWorkletButton.addEventListener('click', () => {
          audioCtx.audioWorklet
            .addModule(workletUrl)
            .then(() => {
              console.log('Worklet registered');
              workletNode = new AudioWorkletNode(audioCtx, 'minitone-processor');
              workletNode.connect(audioCtx.destination);

              // receiverNode
              // workletNode.port.addEventListener('message', (e) => {
              //   console.log('CODY main.ts received message', e);
              // });

              workletNode.port.onmessage = (e) => {
                console.log('CODY main.ts received message', e);
              };
            })
            .catch((err) => {
              console.error('Worklet registration failed', err);
              console.log(err);
            });
        });

        const playWorkletButton = div.querySelector('#playWorklet') as HTMLButtonElement;
        playWorkletButton.addEventListener('click', () => {
          // const context = new AudioContext();
          // const workletNode = new AudioWorkletNode(audioCtx, 'sine-oscillator');
          // workletNode.connect(audioCtx.destination);
          // workletNode.port.addEventListener('message', (e) => {
          //   console.log('CODY main.ts received message', e);
          // });
          // workletNode.parameters.get('frequency').setValueAtTime(440, context.currentTime);
          if (workletNode) {
            console.log('CODY sending message from main.ts...');
            workletNode.port.postMessage({ message: 'Hello World' });
            console.log('CODY message sent...');
          }
        });
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

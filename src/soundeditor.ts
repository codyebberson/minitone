import { Component } from './component';
import { FILTER_LOPASS, playSong, sawtooth } from './player';

const HTML = `
<table>
<tr>
  <td>NAME</td>
  <td>
    <input id="name" name="name" size="30" />
    <button id="save">Save</button>
    <button id="reset">Reset</button>
  </td>
</tr>
<tr>
  <td>OSC(t)</td>
  <td>
    <input
      id="oscillator"
      name="oscillator"
      size="50"
    />
  </td>
</tr>
<tr>
  <td>ATTACK (sec)</td>
  <td><input id="attack" name="attack" size="6" /></td>
</tr>
<tr>
  <td>DECAY (sec)</td>
  <td><input id="decay" name="decay" size="6" /></td>
</tr>
<tr>
  <td>SUSTAIN (gain)</td>
  <td><input id="sustain" name="sustain" size="6" /></td>
</tr>
<tr>
  <td>RELEASE (sec)</td>
  <td><input id="release" name="release" size="6" /></td>
</tr>
<tr>
  <td>DURATION (sec)</td>
  <td>
    <input id="duration" name="duration" size="6" />
  </td>
</tr>
<tr>
  <td>FILTER</td>
  <td>
    <select id="filter" name="filter">
      <option value="0">None</option>
      <option value="1">High</option>
      <option value="2">Low</option>
      <option value="3">Band</option>
      <option value="4">Notch</option>
    </select>
  </td>
</tr>
<tr>
  <td>FILTER FREQ</td>
  <td>
    <input id="filterFreq" name="filterFreq" size="30" />
  </td>
</tr>
<tr>
  <td>FILTER RES</td>
  <td>
    <input id="filterRes" name="filterRes" size="30" />
  </td>
</tr>
<tr>
  <td>UNISON</td>
  <td><input id="unison" name="unison" size="6" /></td>
</tr>
<tr>
  <td>DETUNE</td>
  <td><input id="detune" name="detune" size="6" /></td>
</tr>
<tr>
  <td>SLIDE</td>
  <td><input id="slide" name="slide" size="6" /></td>
</tr>
<tr>
  <td></td>
  <td><button id="play">Play</button></td>
</tr>
</table>
`;

export class SoundEditor implements Component {
  render(parent: HTMLElement): void {
    const div = document.createElement('div');
    div.innerHTML = HTML;
    parent.appendChild(div);

    const playButton = div.querySelector('#play') as HTMLButtonElement;
    playButton.addEventListener('click', () => {
      console.log('play');
      playSong({
        sequences: [
          {
            instrument: {
              frequency: () => 440,
              oscillator: (t) => 0.1 * sawtooth(t),
              attack: 0.5,
              decay: 0.1,
              sustain: 1,
              release: 0.5,
              filter: FILTER_LOPASS,
              filterFreq: () => 1000,
              filterRes: () => 0.5,
              unison: 1,
              detune: 0.001,
            },
            notes: [
              {
                baseFrequency: 440,
                start: 0,
                duration: 1,
              },
            ],
          },
        ],
      });
    });
  }
}

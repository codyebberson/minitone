// /** Global sample rate. */
// export const SAMPLE_RATE = 44100.0;

/** No filter. */
export const FILTER_NONE = 0;

/** High pass filter. */
export const FILTER_HIPASS = 1;

/** Low pass filter. */
export const FILTER_LOPASS = 2;

/** Bandpass filter. */
export const FILTER_BANDPASS = 3;

/** Notch filter. */
export const FILTER_NOTCH = 4;

/** Global audio context. */
export const audioCtx = new AudioContext();

/** Global sample rate. */
export const SAMPLE_RATE = audioCtx.sampleRate;
export const sampleRate = audioCtx.sampleRate;

/** Master gain node. */
export const masterGainNode = audioCtx.createGain();
masterGainNode.connect(audioCtx.destination);
masterGainNode.gain.value = 0.8;

export function createAudioBuffer(duration: number): AudioBuffer {
  const samples = (duration * SAMPLE_RATE) | 0;
  console.log("CODY samples", samples);
  return audioCtx.createBuffer(2, samples, SAMPLE_RATE);
}

export function getAudioBufferData(audioBuffer: AudioBuffer): Float32Array[] {
  return [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
}

export function clearAudioBuffer(audioBuffer: AudioBuffer): void {
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channel = audioBuffer.getChannelData(i);
    for (let j = 0; j < channel.length; j++) {
      channel[j] = 0;
    }
  }
}

const reverbDuration = 2.0;
const impulse = createAudioBuffer(reverbDuration);
const [impulseL, impulseR] = getAudioBufferData(impulse);
const reverbLength = impulseL.length;
const decay = 5;
for (let i = 0; i < reverbLength; i++) {
  impulseL[i] =
    0.25 * (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, decay);
  impulseR[i] =
    0.25 * (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, decay);
}

/** Reverb convolver. */
const reverbConvolver = audioCtx.createConvolver();
reverbConvolver.buffer = impulse;
reverbConvolver.connect(masterGainNode);

/**
 * Returns the input as the output.
 * The identity function is a useful placeholder for instrument functions.
 * @param x Input value.
 * @returns Output value.
 */
export const identity = (x: number): number => x;

/**
 * Clamps an input value to the range [min, max].
 * @param x The input number.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped result.
 */
export const clamp = (x: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, x));

/**
 * Returns a sin wave with input phase from 0 to 1.
 * @param t The time in phase from 0 to 1.
 * @returns The sin output from -1 to 1.
 */
export const sint = (t: number): number => Math.sin(2 * Math.PI * t);

/**
 * Returns a square wave with input phase from 0 to 1.
 * @param t The time in phase from 0 to 1.
 * @returns The square output from -1 to 1.
 */
export const square = (t: number): number => (t % 1.0 < 0.5 ? 1 : -1);

/**
 * Returns a sawtooth wave with input phase from 0 to 1.
 * @param t The time in phase from 0 to 1.
 * @returns The sawtooth output from -1 to 1.
 */
export const sawtooth = (t: number): number => 2 * (t % 1) - 1;

/**
 * Returns a triangle wave with input phase from 0 to 1.
 * @param t The time in phase from 0 to 1.
 * @returns The triangle output from -1 to 1.
 */
export const triangle = (t: number): number => Math.abs(4 * (t % 1) - 2) - 1;

/**
 * Returns a white noise sample.
 * @returns The white noise output from -1 to 1.
 */
export const whiteNoise = (): number => Math.random() * 2 - 1;

/**
 * Returns the ADSR envelope amplitude for the current time t.
 *
 * ADSR envelope has four stages:
 *   1) Attack is the time taken for initial run-up of level from nil to peak, beginning when the key is pressed.
 *   2) Decay is the time taken for the subsequent run down from the attack level to the designated sustain level.
 *   3) Sustain is the level during the main sequence of the sound's duration, until the key is released.
 *   4) Release is the time taken for the level to decay from the sustain level to zero after the key is released.
 *
 *          Attack    Decay Sustain    Release
 *          [--------][----][---------][-----]
 *     max |-----------\
 *   A     |            \
 *   m     |             \
 *   p     |              \
 *   l     |               \-----------\
 *   i     |                            \
 *   t     |                             \
 *   u     |                              \
 *   d     |                               \
 *   e   0 +----------------------------------> time
 *
 * While attack, decay, and release refer to time, sustain refers to level.
 *
 * Since we are operating on predetermined notes, we use "duration" rather than key press and key release.
 *
 * From t=0 to t=a (attack period), the volume increases from 0.0 to 1.0.
 * From t=a to t=d (decay period), the volume decreases from 1.0 to s (sustain).
 * From t=d to t=du (sustain period), the volume stays constant at s (sustain).
 * From t=du to t=du+r (release period), the volume decreases from s (sustain) to 0.0.
 * After that, the volume is 0.0.
 *
 * See more: https://en.wikipedia.org/wiki/Envelope_(music)
 *
 * @param a Attack
 * @param d Decay
 * @param s Sustain
 * @param r Release
 * @param du Duration
 * @param t Current time
 */
export const envelope = (
  a: number,
  d: number,
  s: number,
  r: number,
  du: number,
  t: number
): number =>
  t < a // From t=0 to t=a (attack period)
    ? t / a // the volume increases from 0.0 to 1.0
    : t < a + d // From t=a to t=d (decay period)
    ? 1.0 - ((t - a) / d) * (1 - s) // the volume decreases from 1.0 to s (sustain)
    : t < du // From t=d to t=du (sustain period)
    ? s // the volume stays constant at s (sustain)
    : t < du + r // From t=du to t=du+r (release period)
    ? (1.0 - (t - du) / r) * s // release
    : 0.0; // After that, the volume is 0.0.

export interface Song {
  sequences: Sequence[];
}

export interface Sequence {
  instrument: Instrument;
  notes: Note[];
}

export interface Note {
  baseFrequency: number;
  start: number;
  duration: number;
  volume?: number;
  glide?: number;
}

export interface Instrument {
  name?: string;
  frequency: (x: number, t: number) => number;
  oscillator: (t: number) => number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filter: number;
  filterFreq: (x: number, t: number) => number;
  filterRes: (x: number, t: number) => number;
  unison: number;
  detune: number;
}

export interface Voice {
  ratio: number;
  frequency: number;
  phi: number;
  pan: number;
}

/**
 * Creates a new voice state.
 * @param ratio The ratio of this voice to the primary voice. 1.0 is the primary voice.
 * @param firstMidi The initial MIDI note number.
 * @returns Voice state.
 */
const createVoice = (ratio: number, pan = 0.5): Voice => ({
  ratio,
  pan,
  frequency: 0,
  phi: Math.random(),
});

/**
 * Adds a note to the output audio buffer.
 * @param data The output audio buffer.
 * @param instr The instrument definition.
 * @param voice The voice state.
 * @param start The start time.
 * @param duration The note duration.
 * @param baseFrequency The base frequency of the note.
 * @param volume Optional volume.
 * @param glide Optional glide.
 */
const addNote = (
  data: Float32Array[],
  instr: Instrument,
  voice: Voice,
  start: number,
  duration: number,
  baseFrequency: number,
  volume: number,
  glide = 0
): void => {
  const { oscillator, attack, decay, sustain, release, filter } = instr;
  const end = ((start + duration + release) * SAMPLE_RATE) | 0;
  let i = (start * SAMPLE_RATE) | 0;
  let low = 0;
  let band = 0;
  const glideRate = 1 / ((glide / 20) * SAMPLE_RATE + 1);

  while (i < end) {
    const t = Math.max(0, i / SAMPLE_RATE - start);
    const targetFreq = instr.frequency(baseFrequency, t) * voice.ratio;

    // If this is the first note, then set the frequency directly
    voice.frequency = voice.frequency || targetFreq;

    // Glide the frequency
    voice.frequency =
      glideRate * targetFreq + (1 - glideRate) * voice.frequency;
    voice.phi += voice.frequency / SAMPLE_RATE;

    // Apply envelope before or after the filter?
    let sample =
      // envelope(attack, decay, sustain, release, duration, t) *
      oscillator(voice.phi /* % 1 */);

    const filterFreq = instr.filterFreq(baseFrequency, t);
    const filterRes = instr.filterRes(baseFrequency, t);
    const f = 1.5 * Math.sin((filterFreq * Math.PI) / SAMPLE_RATE);
    low += f * band;
    const high = filterRes * (sample - band) - low;
    band += f * high;
    switch (filter) {
      case FILTER_HIPASS:
        sample = high;
        break;
      case FILTER_LOPASS:
        sample = low;
        break;
      case FILTER_BANDPASS:
        sample = band;
        break;
      case FILTER_NOTCH:
        sample = low + high;
        break;
    }

    // data[i] += volume * sample;
    // data[0][i] += (1 - voice.pan) * volume * sample;
    // data[1][i] += voice.pan * volume * sample;
    sample *= envelope(attack, decay, sustain, release, duration, t);
    data[0][i] += Math.sin((voice.pan * Math.PI) / 2) * volume * sample;
    data[1][i] += Math.cos((voice.pan * Math.PI) / 2) * volume * sample;
    // data[0][i] += (0.5 - 0.5 * voice.pan) * volume * sample;
    // data[1][i] += (0.5 + 0.5 * voice.pan) * volume * sample;
    i++;
  }
};

/**
 * Applies a low-pass filter to the given audio buffer.
 * @param data The audio buffer.
 * @param filter The filter type.
 * @param filterFreq The filter frequency in Hz.
 * @param filterRes The filter resonance.
 */
export const applyFilter = (
  data: Float32Array,
  filter: number,
  filterFreq: number,
  filterRes: number
): void => {
  let low = 0;
  let band = 0;
  for (let i = 0; i < data.length; i++) {
    let sample = data[i];
    const f = 1.5 * Math.sin((filterFreq * Math.PI) / SAMPLE_RATE);
    low += f * band;
    const high = filterRes * (sample - band) - low;
    band += f * high;
    if (filter === FILTER_HIPASS) {
      sample = high;
    }
    if (filter === FILTER_LOPASS) {
      sample = low;
    }
    if (filter === FILTER_BANDPASS) {
      sample = band;
    }
    if (filter === FILTER_NOTCH) {
      sample = low + high;
    }
    data[i] = sample;
  }
};

/**
 * Generates an audio buffer with the given instrument, note, and duration.
 * @param instrument The instrument definition.
 * @param midi The midi note.
 * @param duration The note duration.
 * @returns The populated audio buffer.
 */
export const generateAudioBuffer = (
  instrument: Instrument,
  baseFrequency: number,
  duration: number
): AudioBuffer =>
  generateSong({
    sequences: [{ instrument, notes: [{ baseFrequency, start: 0, duration }] }],
  });

export const playSong = (
  song: Song,
  loopStart?: number,
  reverb?: boolean
): AudioBufferSourceNode =>
  playAudioBuffer(generateSong(song), loopStart, reverb);

export const generateSong = (song: Song): AudioBuffer => {
  let endTime = 0;
  song.sequences.forEach((sequence) =>
    sequence.notes.forEach(
      (note) =>
        (endTime = Math.max(
          endTime,
          note.start + note.duration + sequence.instrument.release
        ))
    )
  );
  console.log("endTime", endTime);
  // const samples = endTime * SAMPLE_RATE;
  // const audioBuffer = audioCtx.createBuffer(2, samples, SAMPLE_RATE);
  // const data = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
  const audioBuffer = createAudioBuffer(endTime);
  const data = getAudioBufferData(audioBuffer);
  song.sequences.forEach((sequence) => addSequence(data, sequence));
  return audioBuffer;
};

export const addSequence = (data: Float32Array[], sequence: Sequence): void => {
  const { instrument, notes } = sequence;
  const volume = 1 / instrument.unison;
  const voices = [createVoice(1)];
  for (let i = 1; i < instrument.unison / 2; i++) {
    // , 2 * (Math.random() - 0.5)
    voices.push(createVoice(1 + i * instrument.detune, Math.random()));
    voices.push(createVoice(1 / (1 + i * instrument.detune), Math.random()));
  }
  for (const { baseFrequency, start, duration, glide } of notes) {
    addVoicedNote(
      data,
      instrument,
      voices,
      start,
      duration,
      baseFrequency,
      volume,
      glide
    );
  }
};

const addVoicedNote = (
  data: Float32Array[],
  instr: Instrument,
  voices: Voice[],
  start: number,
  duration: number,
  midi: number,
  volume: number,
  glide: number | undefined
): void => {
  let i = 0;
  for (const voice of voices) {
    addNote(
      data,
      instr,
      voice,
      start,
      duration,
      midi,
      i === 0 ? volume * 4 : volume,
      glide
    );
    i++;
  }
};

// export function createAudioBuffer(duration: number): AudioBuffer {
//   const samples = duration * SAMPLE_RATE;
//   return audioCtx.createBuffer(2, samples, SAMPLE_RATE);
//   // const data = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
//   // return audioBuffer;
// }

// export function getAudioBufferData(audioBuffer: AudioBuffer): Float32Array[] {
//   return [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
// }

// export function clearAudioBuffer(audioBuffer: AudioBuffer): void {
//   for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
//     const channel = audioBuffer.getChannelData(i);
//     for (let j = 0; j < channel.length; j++) {
//       channel[j] = 0;
//     }
//   }
// }

export function playAudioBuffer(
  audioBuffer: AudioBuffer,
  // loop?: boolean,
  loopStart?: number,
  reverb?: boolean
): AudioBufferSourceNode {
  const source = audioCtx.createBufferSource();
  // source.loop = !!loop;
  // downloadAudioBuffer(audioBuffer, "shovel_knight.wav");
  source.buffer = audioBuffer;
  source.connect(masterGainNode);
  if (reverb) {
    source.connect(reverbConvolver);
  }
  source.start(); // 0, 13.355);
  // source.loop = loopStart !== undefined;
  // source.loopStart = loopStart ?? 0;
  // source.loop = true;
  // source.loopStart = 13.355;
  // // source.loopEnd = 13.355 + 20;
  // source.loopEnd = 31;
  console.log("loop?", source.loop);
  console.log("loopStart", source.loopStart);
  console.log("reverb", reverb);
  return source;
}

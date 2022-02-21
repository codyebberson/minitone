export class AudioPlayer {
  private readonly audioCtx: AudioContext;
  private readonly source: AudioBufferSourceNode;
  private readonly scriptNode: ScriptProcessorNode;
  volume: number;

  constructor() {
    this.audioCtx = new AudioContext();
    this.source = this.audioCtx.createBufferSource();
    this.scriptNode = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.scriptNode.onaudioprocess = (e) => this.handleEvent(e);
    this.volume = 0;

    // Connect nodes
    this.source.connect(this.scriptNode);
    this.scriptNode.connect(this.audioCtx.destination);
    this.source.start();
  }

  private handleEvent(audioProcessingEvent: AudioProcessingEventInit): void {
    // The output buffer contains the samples that will be modified and played
    const outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      // let inputData = inputBuffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);

      // Loop through the 4096 samples
      for (let sample = 0; sample < outputBuffer.length; sample++) {
        // make output equal to the same as the input
        // outputData[sample] = inputData[sample];

        // add noise to each output sample
        outputData[sample] += (Math.random() * 2 - 1) * this.volume;
      }
    }
  }
}

export const audioPlayer = new AudioPlayer();

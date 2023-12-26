// Copyright (c) 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

type AudioParamDescriptor = {
  name: string;
  automationRate: 'a-rate' | 'k-rate';
  minValue: number;
  maxValue: number;
  defaultValue: number;
};

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

declare function registerProcessor(
  name: string,
  processorCtor: (new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor) & {
    parameterDescriptors?: AudioParamDescriptor[];
  }
): void;

class MinitoneProcessor extends AudioWorkletProcessor {
  playing = false;

  constructor() {
    super();
    // this.port.addEventListener('message', (e) => this.handleMessage(e));
    this.port.onmessage = (e) => this.handleMessage(e);
    // this.
  }

  handleMessage(e: any): void {
    console.log('[Processor:Received] ', e);
    this.port.postMessage({ message: 'CODY reply message' });
    this.playing = !this.playing;
    console.log('CODY processor playing', this.playing);
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    // By default, the node has single input and output.
    // const input = inputs[0];
    // const output = outputs[0];

    // for (let channel = 0; channel < output.length; ++channel) {
    //   output[channel].set(input[channel]);
    // }
    // !!inputs;
    !!outputs;

    if (this.playing) {
      // const output = outputs[0];
      // for (let channel = 0; channel < output.length; ++channel) {
      //   for (let i = 0; i < outputs[channel].length; ++i) {
      //     output[channel][i] = Math.random() * 2 - 1;
      //   }
      // }

      for (const channel of outputs[0]) {
        for (let i = 0; i < channel.length; ++i) {
          channel[i] = Math.random() * 2 - 1;
        }
      }
    }

    return true;
  }
}

registerProcessor('minitone-processor', MinitoneProcessor);

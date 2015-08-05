// copied directly from https://github.com/facebook/rebound-js
// rewritten for babel/.eslintrc

// BSD License

// For the rebound-js software

// Copyright (c) 2014, Facebook, Inc. All rights reserved.

// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:

//  * Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.

//  * Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.

//  * Neither the name Facebook nor the names of its contributors may be used to
//    endorse or promote products derived from this software without specific
//    prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const colorCache = {};
// Here are a couple of function to convert colors between hex codes and RGB
// component values. These are handy when performing color
// tweening animations.

export function hexToRGB(c) {
  let color = c;
  if (colorCache[color]) {
    return colorCache[color];
  }
  color = color.replace('#', '');
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  const parts = color.match(/.{2}/g);

  const ret = {
    r: parseInt(parts[0], 16),
    g: parseInt(parts[1], 16),
    b: parseInt(parts[2], 16),
  };

  colorCache[color] = ret;
  return ret;
}

export function rgbToHex(red, green, blue) {
  let r = red.toString(16);
  let g = green.toString(16);
  let b = blue.toString(16);
  r = r.length < 2 ? '0' + r : r;
  g = g.length < 2 ? '0' + g : g;
  b = b.length < 2 ? '0' + b : b;
  return '#' + r + g + b;
}

// This helper function does a linear interpolation of a value from
// one range to another. This can be very useful for converting the
// motion of a Spring to a range of UI property values. For example a
// spring moving from position 0 to 1 could be interpolated to move a
// view from pixel 300 to 350 and scale it from 0.5 to 1. The current
// position of the `Spring` just needs to be run through this method
// taking its input range in the _from_ parameters with the property
// animation range in the _to_ parameters.
export function mapValueInRange(value, fromLow, fromHigh, toLow, toHigh) {
  let fromRangeSize = fromHigh - fromLow;
  let toRangeSize = toHigh - toLow;
  let valueScale = (value - fromLow) / fromRangeSize;
  return toLow + (valueScale * toRangeSize);
}

// Interpolate two hex colors in a 0 - 1 range or optionally provide a
// custom range with fromLow,fromHight. The output will be in hex by default
// unless asRGB is true in which case it will be returned as an rgb string.
export function interpolateColor(val, start, end, low, high, asRGB) {
  let fromLow = low === undefined ? 0 : low;
  let fromHigh = high === undefined ? 1 : high;
  let startColor = hexToRGB(start);
  let endColor = hexToRGB(end);
  let r = Math.floor(
    mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r)
  );
  let g = Math.floor(
    mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g)
  );
  let b = Math.floor(
    mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b)
  );
  if (asRGB) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  return rgbToHex(r, g, b);
}

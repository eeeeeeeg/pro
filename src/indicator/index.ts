/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  registerIndicator,
  IndicatorSeries,
  KLineData,
  LineType,
} from "klinecharts";

interface AverageIndicatorResult {
  avg?: number;
}
interface AvgKlineData extends KLineData {
  volumeMultiple?: number;
}

registerIndicator<AverageIndicatorResult>({
  name: "AVG",
  shortName: "AVG",
  calcParams: [],
  series: IndicatorSeries.Price,
  precision: 4,
  shouldOhlc: true,
  shouldFormatBigNumber: false,
  visible: true,
  figures: [
    {
      key: "avg",
      title: "AVG",
      type: "line",
    },
  ],
  calc: (dataList: AvgKlineData[]) =>
    dataList.map((kLine: AvgKlineData) => {
      return {
        avg: calcAvg(kLine),
      };
    }),
  styles: {
    lines: [
      {
        size: 1,
        style: LineType.Solid,
        dashedValue: [2, 2],
        color: "#FFFF00",
        smooth: true,
      },
    ],
  },
});

const calcAvg = (kLine: AvgKlineData) => {
  const { turnover, volume, volumeMultiple } = kLine;
  if (
    turnover &&
    volume &&
    volumeMultiple &&
    Number.isFinite(turnover) &&
    Number.isFinite(volume) &&
    Number.isFinite(volumeMultiple) &&
    volume !== 0 &&
    volumeMultiple !== 0
  ) {
    return turnover / (volume * volumeMultiple);
  }
};

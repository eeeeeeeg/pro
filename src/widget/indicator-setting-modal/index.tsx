/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, createSignal, createEffect } from 'solid-js'

import { utils, IndicatorStyle } from 'klinecharts'

import lodashSet from 'lodash/set'

import { Modal, Input } from '../../component'

import i18n from '../../i18n'

import data from './data'

interface IndicatorSettingModalParams {
  indicatorName: string
  paneId: string
  calcParams: any[]
  styles?: Partial<IndicatorStyle> | null
  defaultStyles?: IndicatorStyle
}

export interface IndicatorSettingModalProps {
  locale: string
  params: IndicatorSettingModalParams
  onClose: () => void
  onConfirm: (result: { calcParams: any[], styles?: Record<string, any> }) => void
}

const IndicatorSettingModal: Component<IndicatorSettingModalProps> = props => {
  const [calcParams, setCalcParams] = createSignal(utils.clone(props.params.calcParams))
  const [styleValues, setStyleValues] = createSignal<Record<string, any>>({})

  const getConfig: (name: string) => any[] = (name: string) => {
    // @ts-expect-error
    return data[name]
  }

  const buildStyleValues = () => {
    const config = getConfig(props.params.indicatorName) ?? []
    const values: Record<string, any> = {}
    config.forEach((item) => {
      if (item?.type === 'style' && item.styleKey) {
        let value = utils.formatValue(props.params.styles ?? {}, item.styleKey)
        if (!utils.isValid(value) && props.params.defaultStyles) {
          value = utils.formatValue(props.params.defaultStyles, item.styleKey)
        }
        if ((!utils.isValid(value) || value === '') && 'default' in item) {
          value = item.default
        }
        values[item.styleKey] = value ?? ''
      }
    })
    return values
  }

  createEffect(() => {
    setCalcParams(utils.clone(props.params.calcParams))
    setStyleValues(buildStyleValues())
  })

  return (
    <Modal
      title={props.params.indicatorName}
      width={360}
      buttons={[
        {
          type: 'confirm',
          children: i18n('confirm', props.locale),
          onClick: () => {
            const config = getConfig(props.params.indicatorName)
            const params: any[] = []
            const styles: Record<string, any> = {}
            let calcIndex = 0
            config.forEach((cfg) => {
              if (cfg?.type === 'style' && cfg.styleKey) {
                const styleValue = styleValues()[cfg.styleKey]
                if (utils.isValid(styleValue) && styleValue !== '') {
                  lodashSet(styles, cfg.styleKey, styleValue)
                }
              } else {
                const param = calcParams()[calcIndex]
                if (!utils.isValid(param) || param === '') {
                  if ('default' in cfg) {
                    params.push(cfg['default'])
                  }
                } else {
                  params.push(param)
                }
                calcIndex += 1
              }
            })
            props.onConfirm({
              calcParams: params,
              styles: Object.keys(styles).length > 0 ? styles : undefined
            })
            props.onClose()
          }
        }
      ]}
      onClose={props.onClose}>
      <div class="klinecharts-pro-indicator-setting-modal-content">
        {(() => {
          const config = getConfig(props.params.indicatorName)
          let calcParamIndex = -1
          return config.map(d => {
            if (d?.type === 'style' && d.styleKey) {
              const styleKey = d.styleKey
              const colorValue = styleValues()[styleKey] ?? ''
              return (
                <>
                  <span>{i18n(d.paramNameKey, props.locale)}</span>
                  <input
                    type="color"
                    class="klinecharts-pro-indicator-setting-modal-color-input"
                    value={colorValue}
                    onInput={(event) => {
                      const value = event.currentTarget.value
                      setStyleValues(prev => ({ ...prev, [styleKey]: value }))
                    }}/>
                </>
              )
            }
            calcParamIndex += 1
            const inputIndex = calcParamIndex
            return (
              <>
                <span >{i18n(d.paramNameKey, props.locale)}</span>
                <Input
                  style={{ width: '200px' }}
                  value={calcParams()[inputIndex] ?? ''}
                  precision={d.precision}
                  min={d.min}
                  onChange={value => {
                    const params = utils.clone(calcParams())
                    params[inputIndex] = value
                    setCalcParams(params)
                  }}/>
              </>
            )
          })
        })()}
      </div>
      
    </Modal>
  )
}

export default IndicatorSettingModal

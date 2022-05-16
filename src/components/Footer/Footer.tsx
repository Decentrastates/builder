import * as React from 'react'
import { FooterProps } from 'decentrastates-ui'
import { Footer as DappsFooter } from 'decentrastates-dapps/dist/containers'

import { locales } from 'modules/translation/utils'

export default class Footer extends React.PureComponent<FooterProps> {
  render() {
    return <DappsFooter locales={locales} {...this.props} />
  }
}

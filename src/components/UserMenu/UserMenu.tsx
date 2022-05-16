import React from 'react'
import { UserMenu as BaseUserMenu } from 'decentrastates-dapps/dist/containers'
import { IntroPopup } from 'components/IntroPopup'
import { Props } from './UserMenu.types'

export default class UserMenu extends React.PureComponent<Props> {
  render() {
    return (
      <>
        <BaseUserMenu {...this.props} />
        <IntroPopup />
      </>
    )
  }
}

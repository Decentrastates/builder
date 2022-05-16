import * as React from 'react'
import { Center } from 'decentrastates-ui'
import { t } from 'decentrastates-dapps/dist/modules/translation/utils'

export default function NotFound() {
  return (
    <Center>
      <span className="secondary-text">{t('global.not_found')}&hellip;</span>
    </Center>
  )
}

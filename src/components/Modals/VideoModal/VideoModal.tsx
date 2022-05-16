import * as React from 'react'
import { Close } from 'decentrastates-ui'
import { ModalProps } from 'decentrastates-dapps/dist/providers/ModalProvider/ModalProvider.types'
import Modal from 'decentrastates-dapps/dist/containers/Modal'
import { t } from 'decentrastates-dapps/dist/modules/translation/utils'

import './VideoModal.css'

export default class VideoModal extends React.PureComponent<ModalProps> {
  render() {
    const { name, onClose } = this.props

    return (
      <Modal name={name} closeIcon={<Close onClick={onClose} />}>
        <Modal.Header>{t('video_modal.title')}</Modal.Header>
        <Modal.Content>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${t('video_modal.youtube_id')}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Modal.Content>
      </Modal>
    )
  }
}

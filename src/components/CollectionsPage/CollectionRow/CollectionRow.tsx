import React from 'react'
import { Table, Icon } from 'decentrastates-ui'
import { t } from 'decentrastates-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import { getCollectionType } from 'modules/collection/utils'
import CollectionStatus from 'components/CollectionStatus'
import CollectionImage from 'components/CollectionImage'
import { Props } from './CollectionRow.types'
import styles from './CollectionRow.module.css'

export default class CollectionRow extends React.PureComponent<Props> {
  handleTableRowClick = () => {
    const { onNavigate, collection } = this.props
    onNavigate(locations.collectionDetail(collection.id, getCollectionType(collection)))
  }

  render() {
    const { collection, itemCount } = this.props
    const type = getCollectionType(collection)

    return (
      <Table.Row className={styles.CollectionRow} onClick={this.handleTableRowClick}>
        <Table.Cell width={4}>
          <div className={styles.imageColumn}>
            <CollectionImage className={styles.image} collectionId={collection.id} />
            <div className={styles.title}>
              <CollectionStatus collection={collection} />
              <div className={styles.name}>{collection.name}</div>
            </div>
          </div>
        </Table.Cell>
        <Table.Cell width={3}>{t(`collection.type.${type}`)}</Table.Cell>
        <Table.Cell width={3}>{itemCount}</Table.Cell>
        <Table.Cell width={2}>
          {collection.isPublished ? (
            <div className={styles.published}>
              {t('global.published')} <Icon name="check" />
            </div>
          ) : null}
        </Table.Cell>
      </Table.Row>
    )
  }
}

import * as React from 'react'
import { Link } from 'react-router-dom'
import { Network } from '@dcl/schemas'
import { Section, Row, Narrow, Column, Header, Button, Icon, Popup, Radio, CheckboxProps, Tabs, Table } from 'decentraland-ui'
import { NetworkCheck } from 'decentraland-dapps/dist/containers'
import { t, T } from 'decentraland-dapps/dist/modules/translation/utils'
import { locations } from 'routing/locations'
import {
  canMintCollectionItems,
  canSeeCollection,
  getCollectionEditorURL,
  isOnSale as isCollectionOnSale,
  isLocked as isCollectionLocked,
  isOwner
} from 'modules/collection/utils'
import CollectionProvider from 'components/CollectionProvider'
import { Item, ItemType } from 'modules/item/types'
import LoggedInDetailPage from 'components/LoggedInDetailPage'
import Notice from 'components/Notice'
import NotFound from 'components/NotFound'
import BuilderIcon from 'components/Icon'
import Back from 'components/Back'
import CollectionStatus from 'components/CollectionStatus'
import CollectionPublishButton from './CollectionPublishButton'
import CollectionContextMenu from './CollectionContextMenu'
import { Props, State } from './CollectionDetailPage.types'
import CollectionItem from './CollectionItem'

import './CollectionDetailPage.css'
import { CollectionType } from 'modules/collection/types'

const STORAGE_KEY = 'dcl-collection-notice'

export default class CollectionDetailPage extends React.PureComponent<Props, State> {
  state: State = {
    tab: this.props.tab || ItemType.WEARABLE
  }

  handleMintItems = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('MintItemsModal', { collectionId: collection!.id })
  }

  handleNewItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('CreateSingleItemModal', { collectionId: collection!.id })
  }

  handleEditName = () => {
    const { collection, onOpenModal } = this.props
    if (collection && !collection.isPublished) {
      onOpenModal('EditCollectionNameModal', { collection })
    }
  }

  handleOnSaleChange = (_event: React.FormEvent<HTMLInputElement>, checkboxProps: CheckboxProps) => {
    const { collection, onOpenModal } = this.props
    const { checked } = checkboxProps
    if (collection && checked !== undefined) {
      onOpenModal('SellCollectionModal', { collectionId: collection.id, isOnSale: checked })
    }
  }

  handleGoBack = () => {
    this.props.onNavigate(locations.collections())
  }

  hasItems(items: Item[]) {
    return items.length > 0
  }

  hasAccess() {
    const { wallet, collection } = this.props
    return wallet !== null && collection !== null && canSeeCollection(collection, wallet.address)
  }

  handleNavigateToEditor = () => {
    const { collection, items, onNavigate } = this.props
    collection && onNavigate(getCollectionEditorURL(collection, items))
  }

  handleTabChange = (tab: ItemType) => {
    const { onNavigate, collection } = this.props
    this.setState({ tab })
    onNavigate(locations.collectionDetail(collection!.id, CollectionType.STANDARD, { tab }))
  }

  renderMisingItemPricePopup(itemType: ItemType) {
    const itemTypeText = itemType === ItemType.WEARABLE ? t('collection_detail_page.wearables') : t('collection_detail_page.emotes')
    return (
      <Popup
        className="modal-tooltip"
        content={t('collection_detail_page.missing_item_price', { item_type: itemTypeText.toLowerCase() })}
        position="top center"
        trigger={<i aria-hidden="true" className="circle icon tiny"></i>}
      />
    )
  }

  renderPage(items: Item[]) {
    const { tab } = this.state
    const { wallet, isOnSaleLoading } = this.props
    const collection = this.props.collection!

    const canMint = canMintCollectionItems(collection, wallet.address)
    const isOnSale = isCollectionOnSale(collection, wallet)
    const isLocked = isCollectionLocked(collection)
    const hasEmotes = items.some(item => item.type === ItemType.EMOTE)
    const hasWearables = items.some(item => item.type === ItemType.WEARABLE)
    const isEmoteMissingPrice = hasEmotes ? items.some(item => item.type === ItemType.EMOTE && !item.price) : false
    const isWearableMissingPrice = hasWearables ? items.some(item => item.type === ItemType.WEARABLE && !item.price) : false
    const hasOnlyEmotes = hasEmotes && !hasWearables
    const filteredItems = items.filter(item => (hasOnlyEmotes ? item.type === ItemType.EMOTE : item.type === tab))
    const showShowTabs = hasEmotes && hasWearables

    return (
      <>
        <Section className={collection.isPublished ? 'is-published' : ''}>
          <Row>
            <Back absolute onClick={this.handleGoBack} />
            <Narrow>
              <Row>
                <Column grow={false} className="name-container">
                  {isLocked ? (
                    <Header size="huge" className="name">
                      {collection.isPublished && <CollectionStatus collection={collection} />}
                      {collection.name}
                    </Header>
                  ) : (
                    <Row className="header-row" onClick={this.handleEditName}>
                      <Header size="huge" className="name">
                        {collection.name}
                      </Header>
                      <BuilderIcon name="edit" className="edit-collection-name" />
                    </Row>
                  )}
                </Column>
                <Column align="right" className="actions-container" shrink={false} grow={false}>
                  <Row className="actions">
                    {collection.isPublished ? (
                      <>
                        {isOwner(collection, wallet.address) ? (
                          <Popup
                            content={
                              isOnSaleLoading
                                ? t('global.loading')
                                : isOnSale
                                ? t('collection_detail_page.unset_on_sale_popup')
                                : t('collection_detail_page.set_on_sale_popup')
                            }
                            position="top center"
                            trigger={
                              <NetworkCheck network={Network.MATIC}>
                                {isEnabled => (
                                  <Radio
                                    toggle
                                    className="on-sale"
                                    checked={isOnSale}
                                    onChange={this.handleOnSaleChange}
                                    label={t('collection_detail_page.on_sale')}
                                    disabled={isOnSaleLoading || !isEnabled}
                                  />
                                )}
                              </NetworkCheck>
                            }
                            hideOnScroll={true}
                            on="hover"
                            inverted
                            flowing
                          />
                        ) : null}

                        <Button basic className="action-button" disabled={!canMint} onClick={this.handleMintItems}>
                          <Icon name="paper plane" />
                          <span className="text">{t('collection_detail_page.mint_items')}</span>
                        </Button>
                      </>
                    ) : null}

                    {items.length && !collection.isPublished ? (
                      <Button basic className="action-button" disabled={isLocked} onClick={this.handleNewItem}>
                        <span className="text">{t('collection_detail_page.add_item')}</span>
                      </Button>
                    ) : null}
                    <Button basic className="action-button" disabled={isLocked || !items.length} onClick={this.handleNavigateToEditor}>
                      <span className="text">{t('collection_detail_page.preview')}</span>
                    </Button>
                    <CollectionPublishButton collection={collection} />
                    {canSeeCollection(collection, wallet.address) ? <CollectionContextMenu collection={collection} /> : null}
                  </Row>
                </Column>
              </Row>
            </Narrow>
          </Row>
        </Section>
        <Narrow>
          <Notice storageKey={STORAGE_KEY}>
            <T
              id="collection_detail_page.notice"
              values={{
                editor_link: <Link to={getCollectionEditorURL(collection, items)}>{t('global.click_here')}</Link>
              }}
            />
          </Notice>

          {showShowTabs ? (
            <Tabs isFullscreen>
              <Tabs.Tab active={tab === ItemType.WEARABLE} onClick={() => this.handleTabChange(ItemType.WEARABLE)}>
                <BuilderIcon name="wearable" />
                {t('collection_detail_page.wearables')}
                {isWearableMissingPrice ? this.renderMisingItemPricePopup(ItemType.WEARABLE) : null}
              </Tabs.Tab>
              <Tabs.Tab active={tab === ItemType.EMOTE} onClick={() => this.handleTabChange(ItemType.EMOTE)}>
                <BuilderIcon name="emote" />
                {t('collection_detail_page.emotes')}
                {isEmoteMissingPrice ? this.renderMisingItemPricePopup(ItemType.EMOTE) : null}
              </Tabs.Tab>
            </Tabs>
          ) : null}

          {this.hasItems(items) ? (
            <Table basic="very">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t('collection_detail_page.table.item')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_detail_page.table.rarity')}</Table.HeaderCell>
                  <Table.HeaderCell>{t('collection_detail_page.table.category')}</Table.HeaderCell>
                  {tab === ItemType.EMOTE || hasOnlyEmotes ? (
                    <Table.HeaderCell>{t('collection_detail_page.table.play_mode')}</Table.HeaderCell>
                  ) : null}
                  <Table.HeaderCell>{t('collection_detail_page.table.price')}</Table.HeaderCell>
                  {collection.isPublished ? <Table.HeaderCell>{t('collection_detail_page.table.supply')}</Table.HeaderCell> : null}
                  <Table.HeaderCell>{t('collection_detail_page.table.status')}</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredItems.map(item => (
                  <CollectionItem key={item.id} collection={collection} item={item} />
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="empty">
              <div className="sparkles" />
              <div>
                <span className="empty-collection-title">{t('collection_detail_page.add_items_title')}</span>
                <br />
                {t('collection_detail_page.add_items_subtitle')}
                <br />
                {t('collection_detail_page.cant_remove')}
                <br />
                <Button basic className="empty-action-button" disabled={isLocked} onClick={this.handleNewItem}>
                  <span className="text">{t('collection_detail_page.add_item')}</span>
                </Button>
              </div>
            </div>
          )}
        </Narrow>
      </>
    )
  }

  render() {
    const { isLoading, collection } = this.props
    const hasAccess = this.hasAccess()
    const HUGE_PAGE_SIZE = 5000 // TODO: Remove this ASAP and implement pagination
    return (
      <CollectionProvider id={collection?.id} itemsPage={1} itemsPageSize={HUGE_PAGE_SIZE}>
        {({ isLoading: isLoadingCollectionData, items }) => (
          <LoggedInDetailPage
            className="CollectionDetailPage"
            hasNavigation={!hasAccess && !isLoading && !isLoadingCollectionData}
            isLoading={isLoading || isLoadingCollectionData}
          >
            {hasAccess ? this.renderPage(items) : <NotFound />}
          </LoggedInDetailPage>
        )}
      </CollectionProvider>
    )
  }
}

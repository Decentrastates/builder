import * as React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Dropdown, Button, Icon, Popup, Loader } from 'decentraland-ui'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { buildCollectionForumPost } from 'modules/forum/utils'
import { RoleType } from 'modules/collection/types'
import { getExplorerURL, isOwner as isCollectionOwner, isLocked } from 'modules/collection/utils'
import ConfirmDelete from 'components/ConfirmDelete'
import { Props } from './CollectionContextMenu.types'
import styles from './CollectionContextMenu.module.css'

export default class CollectionContextMenu extends React.PureComponent<Props> {
  handleNavigateToForum = () => {
    const { collection } = this.props
    if (collection.isPublished && collection.forumLink) {
      this.navigateTo(collection.forumLink, '_blank')
    }
  }

  handleNavigateToExplorer = () => {
    const { collection } = this.props
    const explorerLink = getExplorerURL({
      collection
    })
    this.navigateTo(explorerLink, '_blank')
  }

  handlePostToForum = () => {
    const { collection, items, name, onPostToForum } = this.props
    if (!collection.forumLink) {
      onPostToForum(collection, buildCollectionForumPost(collection, items, name))
    }
  }

  handleUpdateManagers = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('ManageCollectionRoleModal', { type: RoleType.MANAGER, collectionId: collection.id, roles: collection.managers })
  }

  handleUpdateMinters = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('ManageCollectionRoleModal', { type: RoleType.MINTER, collectionId: collection.id, roles: collection.minters })
  }

  handleAddExistingItem = () => {
    const { collection, onOpenModal } = this.props
    onOpenModal('AddExistingItemModal', { collectionId: collection.id })
  }

  handleDeleteCollection = () => {
    const { collection, onDelete } = this.props
    onDelete(collection)
  }

  navigateTo = (url: string, target = '') => {
    const newWindow = window.open(url, target)
    if (newWindow) {
      newWindow.focus()
    }
  }

  render() {
    const { collection, wallet, isForumPostLoading } = this.props
    const isOwner = isCollectionOwner(collection, wallet.address)
    return (
      <Dropdown
        className={styles.dropdown}
        trigger={
          <Button basic>
            <Icon className={styles.ellipsis} name="ellipsis horizontal" />
          </Button>
        }
        inline
        direction="left"
      >
        <Dropdown.Menu>
          <Dropdown.Item text={t('collection_context_menu.see_in_world')} onClick={this.handleNavigateToExplorer} />

          {collection.isPublished ? (
            isOwner ? (
              <>
                <Dropdown.Item text={t('collection_context_menu.managers')} onClick={this.handleUpdateManagers} />
                <Dropdown.Item text={t('collection_context_menu.minters')} onClick={this.handleUpdateMinters} />
              </>
            ) : null
          ) : !isLocked(collection) ? (
            <>
              <Dropdown.Item text={t('collection_context_menu.add_existing_item')} onClick={this.handleAddExistingItem} />
              <ConfirmDelete
                name={collection.name}
                onDelete={this.handleDeleteCollection}
                trigger={<Dropdown.Item text={t('global.delete')} />}
              />
            </>
          ) : null}

          <CopyToClipboard text={collection.urn}>
            <Dropdown.Item text={t('collection_context_menu.copy_urn')} />
          </CopyToClipboard>

          <Popup
            content={t('collection_context_menu.unpublished')}
            position="right center"
            disabled={collection.isPublished}
            trigger={
              <CopyToClipboard text={collection.contractAddress!}>
                <Dropdown.Item disabled={!collection.isPublished} text={t('collection_context_menu.copy_address')} />
              </CopyToClipboard>
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />

          <Popup
            content={
              !collection.isPublished
                ? t('collection_context_menu.unpublished')
                : !collection.forumLink
                ? t('collection_context_menu.not_posted')
                : undefined
            }
            disabled={collection.isPublished || !!collection.forumLink}
            position="right center"
            trigger={
              !collection.isPublished || collection.forumLink ? (
                <Dropdown.Item
                  disabled={!collection.isPublished}
                  text={t('collection_context_menu.forum_post')}
                  onClick={this.handleNavigateToForum}
                />
              ) : isOwner ? (
                <Dropdown.Item onClick={this.handlePostToForum} disabled={isForumPostLoading}>
                  {isForumPostLoading ? (
                    <div>
                      {t('collection_context_menu.posting')}&nbsp;&nbsp;
                      <Loader size="mini" active inline />
                    </div>
                  ) : (
                    t('collection_context_menu.post_to_forum')
                  )}
                </Dropdown.Item>
              ) : null
            }
            hideOnScroll={true}
            on="hover"
            inverted
            flowing
          />
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

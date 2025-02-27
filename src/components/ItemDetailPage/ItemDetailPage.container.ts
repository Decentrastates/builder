import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getData as getWallet } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getItemId } from 'modules/location/selectors'
import { getCollection } from 'modules/collection/selectors'
import { getItem, getLoading, hasViewAndEditRights } from 'modules/item/selectors'
import { openModal } from 'modules/modal/actions'
import { FETCH_ITEMS_REQUEST, DELETE_ITEM_REQUEST, deleteItemRequest, saveItemRequest, SAVE_ITEM_REQUEST } from 'modules/item/actions'
import { MapStateProps, MapDispatchProps, MapDispatch } from './ItemDetailPage.types'
import ItemDetailPage from './ItemDetailPage'

const mapState = (state: RootState): MapStateProps => {
  const itemId = getItemId(state)
  const item = itemId ? getItem(state, itemId) : null
  const wallet = getWallet(state)!
  const collection = item && item.collectionId ? getCollection(state, item.collectionId) : null

  return {
    itemId,
    wallet,
    item,
    collection,
    isLoading:
      isLoadingType(getLoading(state), FETCH_ITEMS_REQUEST) ||
      isLoadingType(getLoading(state), DELETE_ITEM_REQUEST) ||
      isLoadingType(getLoading(state), SAVE_ITEM_REQUEST),
    hasAccess: item !== null && hasViewAndEditRights(state, wallet.address, collection, item)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSaveItem: (item, contents) => dispatch(saveItemRequest(item, contents)),
  onNavigate: path => dispatch(push(path)),
  onDelete: item => dispatch(deleteItemRequest(item)),
  onOpenModal: (name, metadata) => dispatch(openModal(name, metadata))
})

export default connect(mapState, mapDispatch)(ItemDetailPage)

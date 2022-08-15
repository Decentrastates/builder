import { Dispatch } from 'redux'
import { BodyShape, IPreviewController } from '@dcl/schemas'
import { Collection } from 'modules/collection/types'
import { Item } from 'modules/item/types'
import { setItems, SetItemsAction } from 'modules/editor/actions'
import { fetchCollectionsRequest, FetchCollectionsRequestAction } from 'modules/collection/actions'
import {
  FetchCollectionItemsRequestAction,
  fetchItemsRequest,
  FetchItemsRequestAction,
  setCollection,
  SetCollectionAction
} from 'modules/item/actions'

export enum ItemEditorTabs {
  COLLECTIONS = 'collections',
  ORPHAN_ITEMS = 'orphanItems'
}

export type Props = {
  address?: string
  isConnected: boolean
  items: Item[]
  totalItems: number | null
  totalCollections: number | null
  orphanItems: Item[]
  collections: Collection[]
  selectedItemId: string | null
  selectedCollectionId: string | null
  visibleItems: Item[]
  isReviewing: boolean
  bodyShape: BodyShape
  isLoading: boolean
  isPlayingEmote: boolean
  wearableController: IPreviewController | null
  onSetItems: typeof setItems
  onSetCollection: typeof setCollection
  onFetchOrphanItems: typeof fetchItemsRequest
  onFetchCollections: typeof fetchCollectionsRequest
  onSetReviewedItems: (itemIds: Item[]) => void
}

export type State = {
  currentTab: ItemEditorTabs
  pages: number[]
}

export type MapStateProps = Pick<
  Props,
  | 'address'
  | 'items'
  | 'totalItems'
  | 'totalCollections'
  | 'orphanItems'
  | 'collections'
  | 'selectedItemId'
  | 'selectedCollectionId'
  | 'visibleItems'
  | 'bodyShape'
  | 'wearableController'
  | 'isConnected'
  | 'isReviewing'
  | 'isLoading'
  | 'isPlayingEmote'
>
export type MapDispatchProps = Pick<Props, 'onSetItems' | 'onSetCollection' | 'onFetchOrphanItems' | 'onFetchCollections'>
export type MapDispatch = Dispatch<
  SetItemsAction | SetCollectionAction | FetchCollectionItemsRequestAction | FetchItemsRequestAction | FetchCollectionsRequestAction
>

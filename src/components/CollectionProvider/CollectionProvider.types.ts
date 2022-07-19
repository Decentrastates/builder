import { Dispatch } from 'redux'
import { FetchCollectionsParams } from 'lib/api/builder'
import { Collection } from 'modules/collection/types'
import { fetchCollectionRequest, FetchCollectionRequestAction } from 'modules/collection/actions'
import { Item } from 'modules/item/types'
import { fetchCollectionItemsRequest, FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'

export const DEFAULT_ITEMS_PAGE = 1
export const DEFAULT_ITEMS_PAGE_SIZE = 50

export type Props = {
  id: string | null
  collection: Collection | null
  paginatedCollections: Collection[]
  items: Item[]
  paginatedItems: Item[]
  itemsPage?: number | number[]
  itemsPageSize?: number
  fetchOptions?: Pick<FetchCollectionsParams, 'status' | 'synced'>
  curation: CollectionCuration | null
  itemCurations: ItemCuration[] | null
  isLoading: boolean
  isConnected: boolean
  children: ({
    collection,
    items,
    paginatedItems,
    curation,
    itemCurations,
    isLoading,
    onFetchCollectionItemsPages
  }: {
    collection: Collection | null
    paginatedCollections: Collection[]
    items: Item[]
    paginatedItems: Item[]
    curation: CollectionCuration | null
    itemCurations: ItemCuration[] | null
    isLoading: boolean
    onFetchCollectionItemsPages: typeof fetchCollectionItemsRequest
  }) => React.ReactNode
  onFetchCollection: typeof fetchCollectionRequest
  onFetchCollectionItems: typeof fetchCollectionItemsRequest
}

export type MapStateProps = Pick<
  Props,
  'id' | 'collection' | 'items' | 'isLoading' | 'isConnected' | 'curation' | 'itemCurations' | 'paginatedItems' | 'paginatedCollections'
>
export type MapDispatchProps = Pick<Props, 'onFetchCollection' | 'onFetchCollectionItems'>
export type MapDispatch = Dispatch<FetchCollectionRequestAction | FetchCollectionItemsRequestAction>
export type OwnProps = Partial<Pick<Props, 'id' | 'itemsPage' | 'itemsPageSize'>>

import { Coord } from 'decentrastates-ui'
import { Transaction } from 'decentrastates-dapps/dist/modules/transaction/types'
import { Item } from 'modules/item/types'

export type Props = {
  selection?: Coord[]
  address?: string
  collectionId?: string
  item?: Item
  slotsToyBuy?: number
  text: React.ReactNode
  tx: Transaction
}

export type MapStateProps = {}
export type MapDispatchProps = {}

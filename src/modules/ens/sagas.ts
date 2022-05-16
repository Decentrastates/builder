import { Eth, SendTx } from 'web3x/eth'
import { Address } from 'web3x/address'
import { TransactionReceipt } from 'web3x/formatters'
import { Contract, providers } from 'ethers'
import { namehash } from '@ethersproject/hash'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import * as contentHash from 'content-hash'
import { Network } from '@dcl/schemas'
import { ContractName, getContract } from 'decentrastates-transactions'
import { getAddress } from 'decentrastates-dapps/dist/modules/wallet/selectors'
import { getChainIdByNetwork, getNetworkProvider } from 'decentrastates-dapps/dist/lib/eth'
import { Wallet } from 'decentrastates-dapps/dist/modules/wallet/types'

import { ENS as ENSContract } from 'contracts/ENS'
import { ENSResolver } from 'contracts/ENSResolver'
import { ENS_ADDRESS, ENS_RESOLVER_ADDRESS, CONTROLLER_ADDRESS, MANA_ADDRESS } from 'modules/common/contracts'
import { DCLController } from 'contracts/DCLController'
import { ERC20 as MANAToken } from 'contracts/ERC20'
import { getWallet } from 'modules/wallet/utils'
import { marketplace } from 'lib/api/marketplace'
import { ipfs } from 'lib/api/ipfs'
import { getLands } from 'modules/land/selectors'
import { FETCH_LANDS_SUCCESS } from 'modules/land/actions'
import { Land } from 'modules/land/types'
import { closeModal } from 'modules/modal/actions'
import {
  FETCH_ENS_REQUEST,
  FetchENSRequestAction,
  fetchENSSuccess,
  fetchENSFailure,
  SET_ENS_CONTENT_REQUEST,
  SetENSContentRequestAction,
  setENSContentSuccess,
  setENSContentFailure,
  SET_ENS_RESOLVER_REQUEST,
  SetENSResolverRequestAction,
  setENSResolverSuccess,
  setENSResolverFailure,
  FETCH_ENS_AUTHORIZATION_REQUEST,
  FetchENSAuthorizationRequestAction,
  fetchENSAuthorizationRequest,
  fetchENSAuthorizationSuccess,
  fetchENSAuthorizationFailure,
  FETCH_ENS_LIST_REQUEST,
  FetchENSListRequestAction,
  fetchENSListRequest,
  fetchENSListSuccess,
  fetchENSListFailure,
  CLAIM_NAME_REQUEST,
  ClaimNameRequestAction,
  claimNameSuccess,
  claimNameFailure,
  ALLOW_CLAIM_MANA_REQUEST,
  AllowClaimManaRequestAction,
  allowClaimManaSuccess,
  allowClaimManaFailure
} from './actions'
import { ENS, ENSOrigin, ENSError, Authorization } from './types'
import { getDomainFromName } from './utils'

export function* ensSaga() {
  yield takeLatest(FETCH_LANDS_SUCCESS, handleConnectWallet)
  yield takeEvery(FETCH_ENS_REQUEST, handleFetchENSRequest)
  yield takeEvery(SET_ENS_RESOLVER_REQUEST, handleSetENSResolverRequest)
  yield takeEvery(SET_ENS_CONTENT_REQUEST, handleSetENSContentRequest)
  yield takeEvery(FETCH_ENS_AUTHORIZATION_REQUEST, handleFetchAuthorizationRequest)
  yield takeEvery(FETCH_ENS_LIST_REQUEST, handleFetchENSListRequest)
  yield takeEvery(CLAIM_NAME_REQUEST, handleClaimNameRequest)
  yield takeEvery(ALLOW_CLAIM_MANA_REQUEST, handleApproveClaimManaRequest)
}

function* handleConnectWallet() {
  yield put(fetchENSAuthorizationRequest())
  yield put(fetchENSListRequest())
}

function* handleFetchENSRequest(action: FetchENSRequestAction) {
  const { name, land } = action.payload
  const subdomain = name.toLowerCase() + '.dcs.eth'
  try {
    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const address = wallet.address
    const nodehash = namehash(subdomain)
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))

    const resolverAddress: Address = yield call(() => ensContract.methods.resolver(nodehash).call())

    if (resolverAddress.toString() === Address.ZERO.toString()) {
      yield put(
        fetchENSSuccess({
          name,
          address,
          subdomain,
          resolver: Address.ZERO.toString(),
          content: Address.ZERO.toString()
        })
      )
      return
    }

    const resolverContract = new ENSResolver(eth, resolverAddress)
    const ipfsHash: string = yield call(() => ipfs.uploadRedirectionFile(land))
    const landHash = contentHash.fromIpfs(ipfsHash)

    const currentContent: string = yield call(() => resolverContract.methods.contenthash(nodehash).call())
    if (currentContent === Address.ZERO.toString()) {
      yield put(
        fetchENSSuccess({
          address,
          name,
          subdomain,
          resolver: resolverAddress.toString(),
          content: Address.ZERO.toString(),
          ipfsHash
        })
      )
      return
    }

    if (`0x${landHash}` === currentContent) {
      yield put(
        fetchENSSuccess({
          address,
          name,
          subdomain,
          resolver: ENS_RESOLVER_ADDRESS,
          content: landHash,
          ipfsHash,
          landId: land.id
        })
      )
      return
    }

    yield put(
      fetchENSSuccess({
        address,
        name,
        subdomain,
        resolver: ENS_RESOLVER_ADDRESS,
        content: currentContent || Address.ZERO.toString(),
        landId: ''
      })
    )
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchENSFailure(ensError))
  }
}

function* handleSetENSResolverRequest(action: SetENSResolverRequestAction) {
  const { ens } = action.payload
  try {
    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const from = Address.fromString(wallet.address)
    const nodehash = namehash(ens.subdomain)
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))

    const txHash: string = yield call(() =>
      ensContract.methods
        .setResolver(nodehash, Address.fromString(ENS_RESOLVER_ADDRESS))
        .send({ from })
        .getTxHash()
    )
    yield put(setENSResolverSuccess(ens, ENS_RESOLVER_ADDRESS, from.toString(), wallet.chainId, txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.RESOLVER }
    yield put(setENSResolverFailure(ens, ensError))
  }
}

function* handleSetENSContentRequest(action: SetENSContentRequestAction) {
  const { ens, land } = action.payload
  try {
    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const from = Address.fromString(wallet.address)

    let content = ''

    if (land) {
      const ipfsHash: string = yield call(() => ipfs.uploadRedirectionFile(land))
      content = `0x${contentHash.fromIpfs(ipfsHash)}`
    } else {
      content = Address.ZERO.toString()
    }

    const nodehash = namehash(ens.subdomain)
    const resolverContract = new ENSResolver(eth, Address.fromString(ENS_RESOLVER_ADDRESS))

    const txHash: string = yield call(() =>
      resolverContract.methods
        .setContenthash(nodehash, content)
        .send({ from })
        .getTxHash()
    )
    yield put(setENSContentSuccess(ens, content, land, from.toString(), wallet.chainId, txHash))

    if (!land) {
      yield put(closeModal('UnsetENSContentModal'))
    }
  } catch (error) {
    const ensError: ENSError = { message: error.message, code: error.code, origin: ENSOrigin.CONTENT }
    yield put(setENSContentFailure(ens, land, ensError))
  }
}

function* handleFetchAuthorizationRequest(_action: FetchENSAuthorizationRequestAction) {
  try {
    const from: string = yield select(getAddress)
    const chainId = getChainIdByNetwork(Network.ETHEREUM)
    const contract = getContract(ContractName.MANAToken, chainId)
    const provider: Awaited<ReturnType<typeof getNetworkProvider>> = yield call(getNetworkProvider, chainId)
    const mana = new Contract(contract.address, contract.abi, new providers.Web3Provider(provider))
    const allowance: string = yield call(mana.allowance, from, CONTROLLER_ADDRESS)
    const authorization: Authorization = { allowance }

    yield put(fetchENSAuthorizationSuccess(authorization, from.toString()))
  } catch (error) {
    const allowError: ENSError = { message: error.message }
    yield put(fetchENSAuthorizationFailure(allowError))
  }
}

function* handleFetchENSListRequest(_action: FetchENSListRequestAction) {
  try {
    const landHashes: { id: string; hash: string }[] = []
    const lands: Land[] = yield select(getLands)

    for (let land of lands) {
      const landHash: string = yield call(() => ipfs.computeLandHash(land))
      landHashes.push({ hash: `0x${landHash}`, id: land.id })
    }

    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const address = wallet.address
    const ensContract = new ENSContract(eth, Address.fromString(ENS_ADDRESS))
    const domains: string[] = yield call(() => marketplace.fetchENSList(address))

    const ensList: ENS[] = yield call(() =>
      Promise.all(
        domains.map(async data => {
          const name = data
          const subdomain = `${data.toLowerCase()}.dcs.eth`
          let landId: string | undefined = undefined
          let content: string = ''

          const nodehash = namehash(subdomain)
          const resolverAddress: Address = await ensContract.methods.resolver(nodehash).call()
          const resolver = resolverAddress.toString()

          if (resolver !== Address.ZERO.toString()) {
            const resolverContract = new ENSResolver(eth, resolverAddress)
            content = await resolverContract.methods.contenthash(nodehash).call()

            const land = landHashes.find(lh => lh.hash === content)
            if (land) {
              landId = land.id
            }
          }

          const ens: ENS = {
            address,
            name,
            subdomain,
            resolver,
            content,
            landId
          }

          return ens
        })
      )
    )

    yield put(fetchENSListSuccess(ensList))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(fetchENSListFailure(ensError))
  }
}

function* handleClaimNameRequest(action: ClaimNameRequestAction) {
  const { name } = action.payload
  try {
    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const from = Address.fromString(wallet.address)

    const controllerContract = new DCLController(eth, Address.fromString(CONTROLLER_ADDRESS))
    const tx: SendTx<TransactionReceipt> = yield call(() => controllerContract.methods.register(name, from).send({ from }))
    const txHash: string = yield call(() => tx.getTxHash())

    const ens: ENS = {
      address: wallet.address,
      name: name,
      subdomain: getDomainFromName(name),
      resolver: Address.ZERO.toString(),
      content: Address.ZERO.toString()
    }
    yield put(claimNameSuccess(ens, name, wallet.address, wallet.chainId, txHash))
    yield put(closeModal('ClaimNameFatFingerModal'))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(claimNameFailure(ensError))
  }
}

function* handleApproveClaimManaRequest(action: AllowClaimManaRequestAction) {
  const { allowance } = action.payload
  try {
    const [wallet, eth]: [Wallet, Eth] = yield getWallet()
    const from = Address.fromString(wallet.address)
    const manaContract = new MANAToken(eth, Address.fromString(MANA_ADDRESS))

    const txHash: string = yield call(() =>
      manaContract.methods
        .approve(Address.fromString(CONTROLLER_ADDRESS), allowance)
        .send({ from })
        .getTxHash()
    )

    yield put(allowClaimManaSuccess(allowance, from.toString(), wallet.chainId, txHash))
  } catch (error) {
    const ensError: ENSError = { message: error.message }
    yield put(allowClaimManaFailure(ensError))
  }
}

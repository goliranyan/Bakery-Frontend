import React, { createContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { RelayProvider } from '@opengsn/provider'

import { ethers } from 'ethers'
import { CONFIG } from '../config'
import { IWeb3Context } from './Web3Context'
import { IContractContext } from './ContractContext'

// import { connectedMessage } from '../messages/connectedMessage'

enum MessageType {
  text,
  image,
  link,
}

export interface Action {
  // type: MessageType,
  content: String
  onClick: (
    messageContext: MessageContext,
    web3Context: IWeb3Context,
    contractContext: IContractContext,
  ) => Promise<MessageContent[]>
}

export interface MessageContent {
  type: MessageType | MessageType[]
  delay?: number | null
  content: any | any[]
  actions?: Action[]
  sendByUser?: Boolean
  // constructor(
  //   type: MessageType,
  //   content: any,
  //   actions?: Action[],
  //   delay?: number | null,
  // ) {
  //   this.type = type
  //   this.delay = delay ?? null
  //   this.content = content
  //   this.actions = actions ?? []
  // }
}

interface MessageContext {
  history: MessageContent[]
  addMessage: (
    message: MessageContent,
    alternateHistory?: MessageContent[],
  ) => Promise<MessageContent[]>

  //BG
  background: string
  setBackground: (bg: string) => boolean
}

const MessageContext = createContext<MessageContext>({} as MessageContext)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState([] as MessageContent[])
  const [background, setBackground] = useState('bakery_v3_smaller.gif')

  const setBG = (bg: string) => {
    if (bg == background) return false
    setBackground(bg)
    return true
  }

  const addMessage = async (
    message: MessageContent,
    alternateHistory?: MessageContent[],
  ) => {
    // console.log('ADDING MESSAGE', message)
    let hist = alternateHistory ?? history
    const multitype = typeof message.type == 'object'
    if (message.delay && message.delay != null) {
      // var toAdd: MessageContent[] = []
      for (let i = 0; i < message.content.length - 1; i++) {
        const m = message.content[i]
        console.log('setting content ', message.content, m)
        hist = hist.concat([
          {
            type: multitype ? (message.type as MessageType[])[i] : message.type,
            content: m,
          },
        ])
        setHistory(hist)
        await sleep(message.delay ?? 100)
      }
      await sleep(message.delay ?? 100)
    }
    hist = hist.concat([message])
    setHistory(hist)

    return hist
  }

  return (
    <MessageContext.Provider
      value={{ history, addMessage, setBackground: setBG, background }}
    >
      {children}
    </MessageContext.Provider>
  )
}

const useMessageContext = () => React.useContext(MessageContext)

export { MessageProvider, useMessageContext, MessageType }

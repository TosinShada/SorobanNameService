import { Contract as registrarContract, networks as registrarNetwork } from 'sns-registrar-client'
import { Contract as resolverContract, networks as resolverNetwork, Address } from 'sns-resolver-client'
import freighter from "@stellar/freighter-api";
import { useAccount } from './useAccount'
import { useState } from 'react'
import { createHash } from 'crypto'
import { useToast } from '@/components/ui/use-toast'

export function useDomain() {
  const [domainAvailable, setDomainAvailable] = useState<boolean>(false)
  const [domainAddress, setDomainAddress] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false) 
  const account = useAccount()
  const { toast } = useToast()

  const { name } = new resolverContract({
    contractId: resolverNetwork.futurenet.contractId,
    networkPassphrase: resolverNetwork.futurenet.networkPassphrase,
    rpcUrl: 'https://rpc-futurenet.stellar.org:443',
    wallet: freighter,
  })

  // const { available, register } = new registrarContract({
  //   contractId: registrarNetwork.futurenet.contractId,
  //   networkPassphrase: registrarNetwork.futurenet.networkPassphrase,
  //   rpcUrl: 'https://rpc-futurenet.stellar.org:443',
  //   wallet: freighter,
  // })

  async function registerDomain(username: string, address: string) {
    try {
      const { available, register } = new registrarContract({
        contractId: registrarNetwork.futurenet.contractId,
        networkPassphrase: registrarNetwork.futurenet.networkPassphrase,
        rpcUrl: 'https://rpc-futurenet.stellar.org:443',
        wallet: freighter,
      })
      
      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      console.log('Registering domain: ', domain.toString('hex'))

      if (account == null) {
        return
      }

      await register({
        caller: Address.fromString(account.address),
        owner: Address.fromString(address),
        name: domain,
        address_name: Address.fromString(address),
        duration: 31536000n,
      }).catch((error: any) => {
        console.error('register error', error)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function checkDomainStatus(username: string): Promise<void> {
    try {
      const { available, register } = new registrarContract({
        contractId: registrarNetwork.futurenet.contractId,
        networkPassphrase: registrarNetwork.futurenet.networkPassphrase,
        rpcUrl: 'https://rpc-futurenet.stellar.org:443',
        wallet: freighter,
      })
      setChecked(false)
      console.log('Checking domain status: ', username)
      if (username == null || username.length === 0) {
        return
      }
      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      const domainStatus = await available({
        name: domain,
      })
      console.log('Domain status: ', domainStatus)

      setDomainAvailable(domainStatus)
      setChecked(true)
    } catch (error) {
      console.error(error)
      setChecked(true)
    }
  }

  async function resolveDomain(request: string) {
    try {
      if (request == null || request.length === 0) {
        return
      }

      const username = request.split('.')[0]

      console.log('Resolving domain: ', username)

      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      const domainAddress = await name({
        node: domain,
      })
      console.log('Domain address: ', domainAddress)

      setDomainAddress(domainAddress.toString())
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not resolve domain.',
      })
    }
  }

  return {
    registerDomain,
    checkDomainStatus,
    resolveDomain,
    domainAvailable,
    checked,
    domainAddress,
  }
}

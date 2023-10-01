import {
  Contract as registrarContract,
  networks as registrarNetwork,
} from 'sns-registrar-client'
import {
  Contract as resolverContract,
  networks as resolverNetwork,
  Address,
} from 'sns-resolver-client'
import freighter from '@stellar/freighter-api'
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

  const resolverClient = new resolverContract({
    contractId: resolverNetwork.futurenet.contractId,
    networkPassphrase: resolverNetwork.futurenet.networkPassphrase,
    rpcUrl: 'https://rpc-futurenet.stellar.org:443',
    wallet: freighter,
  })

  const registrarClient = new registrarContract({
    contractId: registrarNetwork.futurenet.contractId,
    networkPassphrase: registrarNetwork.futurenet.networkPassphrase,
    rpcUrl: 'https://rpc-futurenet.stellar.org:443',
    wallet: freighter,
  })

  async function registerDomain(username: string, address: string) {
    try {
      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      console.log('Registering domain: ', domain.toString('hex'))

      if (account == null) {
        return
      }

      console.log('logs', {
        caller: Address.fromString(account.address),
        owner: Address.fromString(address),
        name: domain,
        address_name: Address.fromString(address),
        duration: 31536000n,
      })

      await registrarClient
        .register(
          {
            caller: Address.fromString(account.address),
            owner: Address.fromString(address),
            name: domain,
            address_name: Address.fromString(address),
            duration: 31536000n,
          },
          {
            fee: 100,
            secondsToWait: 60,
          }
        )
        .catch((error: any) => {
          console.error('register error', error)
        })
    } catch (error) {
      console.error(error)
    }
  }

  async function checkDomainStatus(username: string): Promise<void> {
    try {
      setChecked(false)
      console.log('Checking domain status: ', username)
      if (username == null || username.length === 0) {
        return
      }

      const domain = createHash('sha256')
        .update(username.toLowerCase())
        .digest()

      const domainStatus = await registrarClient.available({
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
        toast({
          variant: 'destructive',
          title: 'Invalid Request.',
          description: 'Kindly enter the domain name.',
        })
        return
      }

      const names = request.split('.')

      if (names.length < 2) {
        toast({
          variant: 'destructive',
          title: 'Invalid Request.',
          description: 'Kindly enter the full domain name with the suffix.',
        })
        return
      }

      console.log('Resolving domain: ', names)

      const label = names[0]
      const parent = names.slice(1).join('.')

      const parentNode = createHash('sha256').update(parent).digest()

      const labelNode = createHash('sha256').update(label).digest()

      const domainNode = Buffer.concat([labelNode, parentNode])

      const domain = createHash('sha256').update(domainNode).digest()

      const domainAddress = await resolverClient.name({
        node: domain,
      })

      setDomainAddress(domainAddress.toString())
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'An error occured.',
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

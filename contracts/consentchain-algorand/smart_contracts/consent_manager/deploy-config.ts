import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ConsentManagerFactory } from '../artifacts/consent_manager/ConsentManagerClient'

export async function deploy() {
  console.log('=== Deploying ConsentManager ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(ConsentManagerFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })

  // If app was just created, fund the app account for minimum balance and ITxn fees
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (2).algo(), // Fund with 2 ALGO for safe MBB / box creation
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
    console.log(`Funded ConsentManager ${appClient.appAddress} with 2 ALGO.`)
  }

  console.log(`ConsentManager deployed! App ID: ${appClient.appId}, App Address: ${appClient.appAddress}`)
}

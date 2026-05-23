import { execSync } from 'child_process'

export interface SecretConfig {
  name: string
  namespace: string
  data: Record<string, string>
}

export async function sealSecret(config: SecretConfig): Promise<string> {
  try {
    // Create unsealed secret
    const secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: config.name,
        namespace: config.namespace,
      },
      data: Object.entries(config.data).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: Buffer.from(value).toString('base64'),
        }),
        {}
      ),
    }

    const secretYaml = JSON.stringify(secret)

    // Seal the secret using kubeseal
    const sealedSecret = execSync('kubeseal -f -', {
      input: secretYaml,
      encoding: 'utf-8',
    })

    return sealedSecret
  } catch (error) {
    console.error('[v0] Error sealing secret:', error)
    throw error
  }
}

export async function rotateApiKey(
  secretName: string,
  namespace: string,
  keyName: string,
  newKeyValue: string
): Promise<void> {
  try {
    // Update the sealed secret with new key
    execSync(`kubectl patch secret ${secretName} -n ${namespace} -p '{"data":{"${keyName}":"${Buffer.from(newKeyValue).toString('base64')}'"}}'`, {
      encoding: 'utf-8',
    })

    console.log(`[v0] API key rotated for ${secretName}`)
  } catch (error) {
    console.error('[v0] Error rotating API key:', error)
    throw error
  }
}

export async function listSecrets(namespace: string): Promise<any[]> {
  try {
    const output = execSync(`kubectl get secrets -n ${namespace} -o json`, {
      encoding: 'utf-8',
    })

    const result = JSON.parse(output)
    return result.items.filter((item: any) => !item.type.includes('kubernetes.io'))
  } catch (error) {
    console.error('[v0] Error listing secrets:', error)
    return []
  }
}

export async function backupSecrets(namespace: string, outputPath: string): Promise<void> {
  try {
    const secrets = await listSecrets(namespace)

    execSync(
      `kubectl get secrets -n ${namespace} -o yaml > ${outputPath}`,
      { encoding: 'utf-8' }
    )

    console.log(`[v0] Secrets backed up to ${outputPath}`)
  } catch (error) {
    console.error('[v0] Error backing up secrets:', error)
    throw error
  }
}

export async function restoreSecrets(inputPath: string, namespace: string): Promise<void> {
  try {
    execSync(`kubectl apply -f ${inputPath} -n ${namespace}`, {
      encoding: 'utf-8',
    })

    console.log(`[v0] Secrets restored from ${inputPath}`)
  } catch (error) {
    console.error('[v0] Error restoring secrets:', error)
    throw error
  }
}

import { Bonjour } from 'bonjour-service'

export const bonjour = new Bonjour({ port: 9090, disableIPv6: true })

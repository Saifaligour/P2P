// Configuration constants for the easybase-viz application
import b4a from 'b4a'

export const CONFIG = {
  // Logging
  VERBOSE_LOGGING: true, // Toggle detailed console output

  // Timing
  MESSAGE_LOAD_DELAY: 1000, // Delay before loading existing messages (ms)
  WRITABILITY_CHECK_INTERVAL: 1000, // How often to check if base becomes writable (ms)
  STATS_INTERVAL: 30000, // Stats logging interval when verbose (ms)

  // Network
  KEY_EXCHANGE_DELAY: 500, // Delay before sending key exchange (ms)
  WRITER_ADD_DELAY: 1000, // Delay before adding peer as writer (ms)
  WRITABLE_CHECK_DELAY: 500, // Delay before checking writability after member-add (ms)
  INVITE_EXPIRY_MS: 1000 * 60 * 5, // 5 minutes
  BASE_PATH: 'file:///Volumes/Home/practice/P2P/P2P/db'
}

export const UI_CONFIG = {
  // Theme colors (matching CSS)
  BACKGROUND: '#1F2430',
  TEXT: '#CBCCC6',
  ACCENT: '#73D0FF',
  PRIMARY: '#4777B8',

  // Graph colors
  LINK_COLOR: '#4777B8',
  NODE_STROKE: '#CBCCC6',
  LABEL_COLOR: '#CBCCC6',
}

export const GRAPH_CONFIG = {
  // Node sizes
  MESSAGE_NODE_RADIUS: 8,
  SYSTEM_NODE_RADIUS: 12,

  // Animation
  TRANSITION_DURATION: 500,
  EXIT_DURATION: 300,

  // Layout
  MARGIN: 0.1, // Fraction of width/height for margins
  MIN_LAYOUT_SIZE: 10, // Minimum layout denominator
}
const args = (typeof Pear !== 'undefined' && Pear.config?.args) || ['saif']

// Utility function to get CLI arguments
export function parseArgs() {

  return {
    name: args[0] || 'a',
    autobaseKey: args[1] || null,
    autobaseKey1: args[2] || null,
    spam: 0, // Could be parsed from args if needed
    pace: 0  // Could be parsed from args if needed
  }
}

export const PUBLICK_KEY = b4a.alloc(32, 'asdjfnasdfj2412kjdasf21341kdjsdj824dnvyu23r1y2349132ur')
export const SECRET_KEY = b4a.alloc(64, 'asdjfnasdfj2412kjdasf21341kdjsdj824dnvyu23r1y2349132ur')
// console.log('Public Kye ,secrtes Kesy', PUBLICK_KEY.toString('hex'), SECRET_KEY.toString('hex'))
// Usage examples for CLI
export const USAGE_EXAMPLES = [
  'pear run . alice --swarm                    # Start alice with swarm',
  'pear run . bob --swarm --add=<writer-key>   # Start bob and add a writer',
  'pear run . alice --spam=10                  # Spam 10 messages per second'
]

export const PORT = 49737
export const BOOTSTRAP_NODES = [
  '88.99.3.86@node1.hyperdht.org:49737', '142.93.90.113@node2.hyperdht.org:49737', '138.68.147.8@node3.hyperdht.org:49737',
  // `127.0.0.1:${PORT}`, `192.168.1.4:${PORT}`, `192.168.1.255:${PORT}`, `192.168.1.1:${PORT}`
]; // disable public bootstrap nodes


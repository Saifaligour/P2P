// View.js
import Autobase from 'autobase';
import b4a from 'b4a';
import Hyperbee from 'hyperbee';

/**
 * Custom View class extending Autobase
 * Encapsulates Hyperbee logic and adds helper methods
 */
export default class View extends Autobase {
  constructor(store, bootstrap = null, handlers = {}, verbose = true) {
    // Allow handlers as second arg if bootstrap is not a string or buffer
    if (bootstrap && typeof bootstrap !== 'string' && !b4a.isBuffer(bootstrap)) {
      handlers = bootstrap;
      bootstrap = null;
    }

    // Open Hyperbee view
    const open = (viewStore) => {
      const core = viewStore.get('view');
      return new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json', ...handlers });
    };

    // Apply function for Autobase
    const apply = handlers.apply || View.apply;

    super(store, bootstrap, { ...handlers, open, apply });
    this.VERBOSE_LOGGING = verbose;
  }

  /** Default apply method using your JSON-node pattern */
  static async apply(nodes, view, host) {
    const b = view.batch({ update: false });

    for (const node of nodes) {
      const value = JSON.parse(node.value);

      if (value.write) {
        await b.put(value.id, value);
      } else if (value.delete) {
        await b.del(value.id);
      } else if (value.add) {
        await host.addWriter(b4a.from(value.add, 'hex'), { indexer: true });
      } else if (value.remove) {
        await host.removeWriter(b4a.from(value.remove, 'hex'), { indexer: true });
      }
    }

    await b.flush();
  }

  /** Put value into view following JSON-node pattern */
  async put(id, value) {
    return this.append(value);
  }

  /** Delete key from view following JSON-node pattern */
  async del(id) {
    return this.append(JSON.stringify({ delete: true, id }));
  }

  /** Get value from Hyperbee */
  async get(key, opts = {}) {
    await this.view.ready();
    const node = await this.view.get(key, opts);
    if (!node) return null;
    return node.value;
  }

  /** Peek value from view */
  peek(opts = {}) {
    return this.view.peek(opts);
  }

  /** Create a read stream from view */
  createReadStream(range = {}, opts = {}) {
    return this.view.createReadStream(range, opts);
  }
}

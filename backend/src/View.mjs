
import b4a from 'b4a'
import Hyperbee from 'hyperbee'
export default class View {
  constructor(verbose = true) {
    this.VERBOSE_LOGGING = verbose
  }

  open(store) {
    const core = store.get('view')
    const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
    return db
  }

  async apply(nodes, view, host) {
    // console.log('Apply called with nodes:', nodes.length)
    for (const node of nodes) {
      const value = JSON.parse(node.value)
      // console.log('Applying view update for node:', value);
      if (value.add) {
        if (this.VERBOSE_LOGGING) console.log('Processing add writer command for:', value.add)
        // Add as both writer AND indexer
        await host.addWriter(b4a.from(value.add, 'hex'), { indexer: true })
        if (this.VERBOSE_LOGGING) console.log('Writer and indexer added successfully:', value.add)
      }
      else if (value.remove) {
        if (this.VERBOSE_LOGGING) console.log('Processing remove writer command for:', value.remove)
        // Remove as both writer AND indexer
        await host.removeWriter(b4a.from(value.remove, 'hex'), { indexer: true })
        if (this.VERBOSE_LOGGING) console.log('Writer and indexer removed successfully:', value.remove)
      }
      else if (value.delete) {
        view.delete(value.id)
      }
      else if (value.write) {
        view.put(value.id, value)
      }
    }
  }

  close(view) {
    return view.close()
  }
}
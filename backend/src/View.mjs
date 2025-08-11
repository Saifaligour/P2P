
import b4a from 'b4a'
import Hyperbee from 'hyperbee'
export default class View {
  constructor(verbose = false) {
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
      if (value.add) {
        if (this.VERBOSE_LOGGING) console.log('Processing add writer command for:', value.add)
        // Add as both writer AND indexer
        await host.addWriter(b4a.from(value.add, 'hex'), { indexer: true })
        if (this.VERBOSE_LOGGING) console.log('Writer and indexer added successfully:', value.add)
      }

      if (value.gets) {
        const all = []
        for (const delta of value.gets) {
          const seq = view.length - delta
          if (seq < 0 || view.length <= seq) continue
          // console.log('waiting for a block', seq, view.length, view.signedLength)
          const val = JSON.parse(await view.get(seq))
          // console.log('got it!')
          all.push({ seq, value })
        }
        const id = `${Date.now()}}`
        await view.put(id, { gets: all })
      }

      // Store all messages in the view
      const id = `${Date.now()}`
      await view.put(id, { echo: value })
    }
  }

  close(view) {
    return view.close()
  }
}
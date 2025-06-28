const data = {
    "type": "Buffer",
    "data": []
}
// const topic = b4a.toString(new Uint8Array(data.data), 'hex')
// const topic = Buffer.from(data.data).toString('hex');
// console.log(topic);

const topicPeersMap = new Map([['test1', new Set([{ name: 'saif' }])], ['test2', new Set([{ name: 'saif' }])]])
const peer = []
for (const e of topicPeersMap.keys()) {
    const current = topicPeersMap.get(e).size
    peer.push([e, { current, }])
    console.log(current)
}


console.log(new Map(JSON.parse(JSON.stringify(peer))));
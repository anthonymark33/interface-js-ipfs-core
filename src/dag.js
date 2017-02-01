/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const expect = require('chai').expect
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')

module.exports = (common) => {
  describe('.dag (basics)', () => {
    let ipfs

    before(function (done) {
      // CI is slow
      this.timeout(20 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    describe('callback API', () => {
      let pbNode
      let cborNode

      before((done) => {
        const someData = new Buffer('some data')

        pbNode = DAGNode.create(someData, (err, node) => {
          expect(err).to.not.exist
          pbNode = node
          done()
        })

        cborNode = {
          data: someData
        }
      })

      describe('.put', () => {
        it('dag-pb with default hash func (sha2-256)', (done) => {
          ipfs.dag.put(pbNode, 'dag-pb', 'sha2-256', done)
        })

        it('dag-pb with custom hash func (sha3-512)', (done) => {
          ipfs.dag.put(pbNode, 'dag-pb', 'sha3-512', done)
        })

        /*
         * This works because dag-cbor will just treat pbNode as a regular object
        it.skip('dag-pb node with wrong multicodec', (done) => {
          // This works because dag-cbor will just treat pbNode as a
          // regular object
          ipfs.dag.put(pbNode, 'dag-cbor', 'sha3-512', (err) => {
            expect(err).to.exist
            done()
          })
        })
        */

        it('dag-cbor with default hash func (sha2-256)', (done) => {
          ipfs.dag.put(cborNode, 'dag-cbor', 'sha2-256', done)
        })

        it('dag-cbor with custom hash func (sha3-512)', (done) => {
          ipfs.dag.put(cborNode, 'dag-cbor', 'sha3-512', done)
        })

        it('dag-cbor node with wrong multicodec', (done) => {
          ipfs.dag.put(cborNode, 'dag-pb', 'sha3-512', (err) => {
            expect(err).to.exist
            done()
          })
        })
      })

      describe('.get', () => {
        let pbNode
        let cborNode

        before((done) => {
          const someData = new Buffer('some other data')

          pbNode = DAGNode.create(someData, (err, node) => {
            expect(err).to.not.exist
            pbNode = node
            done()
          })

          cborNode = {
            data: someData
          }
        })

        it('dag-pb node', (done) => {
          ipfs.dag.put(pbNode, 'dag-pb', 'sha2-256', (err) => {
            expect(err).to.not.exist
            dagPB.util.cid(pbNode, (err, cid) => {
              expect(err).to.not.exist
              ipfs.dag.get(cid, (err, node) => {
                expect(err).to.not.exist
                expect(pbNode.toJSON()).to.eql(node.toJSON())
                done()
              })
            })
          })
        })

        it('dag-cbor node', (done) => {
          ipfs.dag.put(cborNode, 'dag-cbor', 'sha2-256', (err) => {
            expect(err).to.not.exist
            dagCBOR.util.cid(cborNode, (err, cid) => {
              expect(err).to.not.exist
              ipfs.dag.get(cid, (err, node) => {
                expect(err).to.not.exist
                expect(cborNode).to.eql(node)
                done()
              })
            })
          })
        })
      })
    })

    describe('promise API', () => {
      describe('.put', () => {})
      describe('.get', () => {})
    })
  })
}
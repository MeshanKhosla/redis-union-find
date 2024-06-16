import { expect, test } from "bun:test"
import { UnionFind } from "../UnionFind"
import { Redis } from "@upstash/redis"

test("Connect Alice and Bob", async () => {
	const uf = new UnionFind({
		redis: Redis.fromEnv()
	})

	await uf.connect("Alice", "Bob")
	
	const aliceBobConnected = await uf.isConnected("Alice", "Bob")
	expect(aliceBobConnected).toBeTrue

	const aliceEveConnected = await uf.isConnected("Alice", "Eve")
	expect(aliceEveConnected).toBeFalse
})

test("Connect Alice and Bob, Dave and Eve, Eve and Alice", async () => {
	const uf = new UnionFind({
		redis: Redis.fromEnv()
	})

	await uf.connect("Alice", "Bob")
	await uf.connect("Dave", "Eve")
	await uf.connect("Eve", "Alice")	

	const aliceBobConnected = await uf.isConnected("Alice", "Bob")
	expect(aliceBobConnected).toBeTrue

	const daveEveConnected = await uf.isConnected("Dave", "Eve")
	expect(daveEveConnected).toBeTrue

	const aliceEveConnected = await uf.isConnected("Alice", "Eve")
	expect(aliceEveConnected).toBeTrue

	const aliceDaveConnected = await uf.isConnected("Alice", "Dave")
	expect(aliceDaveConnected).toBeTrue

	const bobDaveConnected = await uf.isConnected("Bob", "Dave")
	expect(bobDaveConnected).toBeTrue

	const bobEveConnected = await uf.isConnected("Bob", "Eve")
	expect(bobEveConnected).toBeTrue
})

test("Get all nodes", async () => {
	const uf = new UnionFind({
		redis: Redis.fromEnv()
	})

	await uf.connect("Alice", "Bob")
	await uf.connect("Dave", "Eve")

	const nodes = await uf.getNodes()
	expect(nodes.length).toBe(4)
	expect(nodes).toContain("Alice")
	expect(nodes).toContain("Bob")
	expect(nodes).toContain("Dave")
	expect(nodes).toContain("Eve")
})

test("Clear all nodes", async () => {
	const uf = new UnionFind({
		redis: Redis.fromEnv()
	})

	await uf.connect("Alice", "Bob")
	await uf.connect("Dave", "Eve")

	await uf.clear()

	const nodes = await uf.getNodes()
	expect(nodes.length).toBe(0)
})
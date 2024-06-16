import { expect, test, afterEach } from "bun:test";
import { UnionFind } from "../UnionFind";

const REDIS_URL = process.env.REDIS_URL!;
const REDIS_TOKEN = process.env.REDIS_TOKEN!;

afterEach(async () => {
  const uf = new UnionFind({
    redisUrl: REDIS_URL,
    redisToken: REDIS_TOKEN,
  });

  await uf.clear();
});

test("Connect Alice and Bob", async () => {
  const uf = new UnionFind({
    redisUrl: REDIS_URL,
    redisToken: REDIS_TOKEN,
  });

  await uf.connect("Alice", "Bob");

  const aliceBobConnected = await uf.areConnected("Alice", "Bob");
  expect(aliceBobConnected).toBeTrue;

  const aliceEveConnected = await uf.areConnected("Alice", "Eve");
  expect(aliceEveConnected).toBeFalse;
});

test("Connect Alice and Bob, Dave and Eve, Eve and Alice", async () => {
  const uf = new UnionFind({
    redisUrl: REDIS_URL,
    redisToken: REDIS_TOKEN,
  });

  await uf.connect("Alice", "Bob");
  await uf.connect("Dave", "Eve");
  await uf.connect("Eve", "Alice");

  const aliceBobConnected = await uf.areConnected("Alice", "Bob");
  expect(aliceBobConnected).toBeTrue;

  const daveEveConnected = await uf.areConnected("Dave", "Eve");
  expect(daveEveConnected).toBeTrue;

  const aliceEveConnected = await uf.areConnected("Alice", "Eve");
  expect(aliceEveConnected).toBeTrue;

  const aliceDaveConnected = await uf.areConnected("Alice", "Dave");
  expect(aliceDaveConnected).toBeTrue;

  const bobDaveConnected = await uf.areConnected("Bob", "Dave");
  expect(bobDaveConnected).toBeTrue;

  const bobEveConnected = await uf.areConnected("Bob", "Eve");
  expect(bobEveConnected).toBeTrue;
});

test("Get all nodes", async () => {
  const uf = new UnionFind({
    redisUrl: REDIS_URL,
    redisToken: REDIS_TOKEN,
  });

  await uf.connect("Alice", "Bob");
  await uf.connect("Dave", "Eve");

  const nodes = await uf.getAllNodes();
  expect(nodes.length).toBe(4);
  expect(nodes).toContain("Alice");
  expect(nodes).toContain("Bob");
  expect(nodes).toContain("Dave");
  expect(nodes).toContain("Eve");
});

test("Clear all nodes", async () => {
  const uf = new UnionFind({
    redisUrl: REDIS_URL,
    redisToken: REDIS_TOKEN,
  });

  await uf.connect("Alice", "Bob");
  await uf.connect("Dave", "Eve");

  await uf.clear();

  const nodes = await uf.getAllNodes();
  expect(nodes.length).toBe(0);
});

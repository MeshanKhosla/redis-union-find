# redis-union-find

This is an implementation of the [Union Find/Disjoint Set](https://cs61b-2.gitbook.io/cs61b-textbook/14.-disjoint-sets) data structure using Redis. 

This project implements WeightedQuickUnion with Path Compression.

## Why?
I think Disjoint Sets are really cool. I also think Redis is very cool.

## Overview of Disjoint Sets
Read my [blog post](https://meshan.dev/blog/redis-union-find/)!

---
Made using Bun and Upstash Redis

I've also published to npm, and you can install it in your project using

```
npm install redis-union-find
```
or
```
bun add redis-union-find
```

and use it like this:

```typescript
const uf = new UnionFind({
  redisToken: process.env.REDIS_TOKEN!,
  redisUrl: process.env.REDIS_URL!,
})

await uf.connect("Alice", "Bob")
```

import { Redis } from "@upstash/redis";

/**
 * UnionFind implementation, WeightedQuickUnion with Path Compression
 *
 * const wqu = new UnionFind();
 *
 * wqu.connect("Alice", "Bob");
 * wqu.connect("Dave", "Eve");
 * wqu.areConnected("Alice", "Bob"); -> true
 * wqu.areConnected("Alice", "Eve"); -> false
 * wqu.connect("Alice", "Eve");
 * wqu.areConnected("Alice", "Eve"); -> true
 */
export class UnionFind {
  private redis: Redis;
  private redisPrefix: string;

  constructor(config: {
    redisUrl: string;
    redisToken: string;
    redisPrefix?: string;
  }) {
    this.redis = new Redis({
      url: config.redisUrl,
      token: config.redisToken,
      enableAutoPipelining: true,
    });

    this.redisPrefix = config.redisPrefix || "!!unionfind!!--";
  }

  /**
   * Returns the Redis key for the given node
   */
  private getRedisKey(node: string) {
    return `${this.redisPrefix}${node}`;
  }

  /**
   * Finds the root node of the given node
   */
  private async findRoot(node: string): Promise<string> {
    let curNode = node;

    while (true) {
      const curNodeKey = this.getRedisKey(curNode);
      const parent = await this.redis.hget<string>(curNodeKey, "parent");
      if (parent == null) {
        throw new Error(`No parent found for ${curNode}`);
      }
      if (parent === curNode) {
        break;
      }

      curNode = parent;
    }

    return curNode;
  }

  /**
   * Connects the two nodes together
   */
  public async connect(nodeOne: string, nodeTwo: string) {
    // If either node is not in Redis yet, add it
    const addNodesScript = `
			local nodeOne = redis.call("HGETALL", KEYS[1])
			local nodeTwo = redis.call("HGETALL", KEYS[2])

			if #nodeOne == 0 then
				redis.call("HSET", KEYS[1], "parent", KEYS[3])
				redis.call("HSET", KEYS[1], "size", 1)
			end

			if #nodeTwo == 0 then
				redis.call("HSET", KEYS[2], "parent", KEYS[4])
				redis.call("HSET", KEYS[2], "size", 1)
			end
		`;

    await this.redis.eval(
      addNodesScript,
      [this.getRedisKey(nodeOne), this.getRedisKey(nodeTwo), nodeOne, nodeTwo],
      []
    );

    const [nodeOneRoot, nodeTwoRoot] = await Promise.all([
      this.findRoot(nodeOne),
      this.findRoot(nodeTwo),
    ]);

    if (nodeOneRoot === nodeTwoRoot) {
      return;
    }

    const [setOneSize, setTwoSize] = await Promise.all([
      this.redis.hget<number>(this.getRedisKey(nodeOneRoot), "size"),
      this.redis.hget<number>(this.getRedisKey(nodeTwoRoot), "size"),
    ]);

    if (setOneSize == null || setTwoSize == null) {
      throw new Error(`Size of ${nodeOneRoot} or ${nodeTwoRoot} not found`);
    }

    // Make smaller set a child of the bigger set
    let smallerSet = setOneSize < setTwoSize ? nodeOneRoot : nodeTwoRoot;
    let biggerSet = setOneSize < setTwoSize ? nodeTwoRoot : nodeOneRoot;

    await this.redis.hset(this.getRedisKey(smallerSet), {
      parent: biggerSet,
    });
    await this.redis.hset(this.getRedisKey(biggerSet), {
      size: setOneSize + setTwoSize,
    });
  }

  /**
   * Returns whether the two nodes are connected
   */
  public async areConnected(nodeOne: string, nodeTwo: string): Promise<boolean> {
    try {
      const [nodeOneRoot, nodeTwoRoot] = await Promise.all([
        this.findRoot(nodeOne),
        this.findRoot(nodeTwo),
      ]);

      return nodeOneRoot === nodeTwoRoot;
    } catch (e) {
      return false;
    }
  }

  private async getAllNodeKeys() {
    return await this.redis.keys(`${this.redisPrefix}*`);
  }

  /**
   * Returns all nodes added to the disjoint set
   */
  public async getAllNodes(): Promise<string[]> {
    const nodeKeys = await this.getAllNodeKeys();
    return nodeKeys.map(nodeKey => nodeKey.slice(this.redisPrefix.length));
  }

  /**
   * Removes all nodes from the disjoint set
   */
  public async clear() {
    const nodes = await this.getAllNodeKeys();
    await Promise.all(nodes.map(node => this.redis.del(node)));
  }
}

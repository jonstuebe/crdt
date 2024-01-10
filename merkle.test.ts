import { describe, expect, it } from "vitest";
import MerkleTree from "merkletreejs";

import {
  createTree,
  getRootValue,
  bufferToString,
  hash,
  createLeaves,
  hasLatestChanges,
  getMissingLeaves,
} from "./merkle";

describe("createTree", () => {
  it("should create a Merkle tree from the given data", () => {
    const data = [1, 2, 3, 4, 5];
    const tree = createTree(data);

    // Assert that the tree is an instance of MerkleTree
    expect(tree).toBeInstanceOf(MerkleTree);

    // Assert that the tree has the correct number of leaves
    expect(tree.getLeafCount()).toStrictEqual(data.length);

    // Assert that the root value of the tree is not empty
    expect(tree.getRoot()).not.toStrictEqual("");
  });

  it("two arrays of the same data should produce the same tree", () => {
    const treeOne = createTree([1, 2, 3, 4, 5]);
    const treeTwo = createTree([1, 2, 3, 4, 5]);

    // Assert that the trees are identical
    expect(hasLatestChanges(getRootValue(treeOne), getRootValue(treeTwo))).toBe(
      true
    );
  });
});

describe("getRootValue", () => {
  it("should return the root value of the given tree", () => {
    const data = [1, 2, 3, 4, 5];
    const tree = createTree(data);

    const rootValue = getRootValue(tree);

    // Assert that the root value is a non-empty string
    expect(typeof rootValue).toBe("string");
    expect(rootValue.length).toBeGreaterThan(0);

    // Assert that the root value is the same as the tree's root
    expect(rootValue).toBe(tree.getRoot().toString("hex"));
  });
});

describe("bufferToString", () => {
  it("should convert a buffer to a hex string", () => {
    const buffer = Buffer.from("Hello, World!", "utf-8");
    const expected = "48656c6c6f2c20576f726c6421";

    const result = bufferToString(buffer);

    expect(result).toBe(expected);
  });
});

describe("createLeaves", () => {
  it("should create an array of buffers from the given data", () => {
    const data = [1, 2, 3, 4, 5];
    const expected = data.map((v) => hash(v));

    const result = createLeaves(data);

    expect(result).toEqual(expected);
  });
  it("two arrays of the same data should produce the same leaves", () => {
    const leavesOne = createLeaves([1, 2, 3, 4, 5]);
    const leavesTwo = createLeaves([1, 2, 3, 4, 5]);

    expect(leavesOne).toStrictEqual(leavesTwo);
  });
});

describe("getMissingLeaves", () => {
  it("returns empty array when client and server are in sync", () => {
    // Create a Merkle trees for client and server
    const clientTree = createTree([1, 2, 3, 4, 5]);
    const serverTree = createTree([1, 2, 3, 4, 5]);

    const missingLeaves = getMissingLeaves(clientTree, serverTree);

    // Assert that the missingLeaves array is empty
    expect(missingLeaves).toEqual([]);
  });

  it("returns missing hashes from server tree", () => {
    // Create a Merkle tree for the client
    const clientTree = createTree([1, 2, 3, 4, 5, 6]);

    // Create a Merkle tree for the server
    const serverTree = createTree([1, 2, 3]);

    // Get the missing leaves from the server tree
    const missingLeaves = getMissingLeaves(clientTree, serverTree);

    // Assert that the missing leaves are correct
    expect(missingLeaves).toEqual(
      [4, 5, 6].map((v) => bufferToString(hash(v)))
    );
  });
});

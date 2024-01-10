import { describe, expect, it } from "vitest";
import { addSeconds } from "date-fns";

import { createTree } from "./merkle";
import {
  UpdateMessage,
  Message,
  getUndeliveredMessages,
  mutate,
  sortMessages,
} from "./mutations";
import { HLC } from "./hlc";

describe("mutate.create", () => {
  it("should create a create message", () => {
    const message = mutate.create(
      {
        entity: "user",
        id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
        version: 1,
        values: {
          first_name: "Jon",
          last_name: "Smith",
        },
      },
      "2024-01-02T12:00:00.000Z-0001-node1"
    );

    expect(message).toEqual({
      type: "create",
      entity: "user",
      id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
      version: 1,
      values: {
        first_name: "Jon",
        last_name: "Smith",
      },
      timestamp: "2024-01-02T12:00:00.000Z-0001-node1",
    });
  });
});

describe("getUndeliveredMessages", () => {
  it("should return an empty array if the trees are identical", () => {
    const getAppVersion = () => 1;

    const clientMessages = [
      mutate.create(
        {
          entity: "user",
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          version: getAppVersion(),
          values: {
            first_name: "Jon",
            last_name: "Smith",
          },
        },
        "2024-01-02T12:00:00.000Z-0001-node1"
      ),
      mutate.update(
        {
          entity: "user",
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          version: getAppVersion(),
          field: "first_name",
          value: "John",
        },
        "2024-01-02T12:00:10.000Z-0002-node1"
      ),
    ];

    const clientTree = createTree(clientMessages);
    const serverTree = createTree(clientMessages);

    const undeliveredMessages = getUndeliveredMessages(
      clientTree,
      serverTree,
      clientMessages
    );

    expect(undeliveredMessages).toEqual([]);
  });

  it("should return an array of changes if the trees are different", () => {
    const getAppVersion = () => 1;

    const clientMessages = [
      mutate.create(
        {
          entity: "user",
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          version: getAppVersion(),
          values: {
            first_name: "Jon",
            last_name: "Smith",
          },
        },
        "2024-01-02T12:00:00.000Z-0001-node1"
      ),
      mutate.update(
        {
          entity: "user",
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          version: getAppVersion(),
          field: "first_name",
          value: "John",
        },
        "2024-01-02T12:00:10.000Z-0002-node1"
      ),
    ];

    const clientTree = createTree(clientMessages);
    const serverTree = createTree([]);

    const undeliveredMessages = getUndeliveredMessages(
      clientTree,
      serverTree,
      clientMessages
    );

    expect(undeliveredMessages.length).toEqual(2);
    expect(undeliveredMessages).toEqual([
      {
        type: "create",
        entity: "user",
        id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
        version: 1,
        values: {
          first_name: "Jon",
          last_name: "Smith",
        },
        timestamp: "2024-01-02T12:00:00.000Z-0001-node1",
      },
      {
        type: "update",
        entity: "user",
        id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
        version: 1,
        field: "first_name",
        value: "John",
        timestamp: "2024-01-02T12:00:10.000Z-0002-node1",
      },
    ]);
  });
});

describe("sortMessages", () => {
  it("should sort messages by weight: timestamp > change > nodeId", () => {
    const baseDate = new Date(2024, 0, 10);
    const messages: UpdateMessage[] = [
      mutate.update(
        {
          entity: "user",
          version: 1,
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          field: "first_name",
          value: "John",
        },
        new HLC({
          timestamp: baseDate.toISOString(),
          counter: 1,
          nodeId: "node1",
        }).get()
      ),
      mutate.update(
        {
          entity: "user",
          version: 1,
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          field: "first_name",
          value: "Johnny",
        },
        new HLC({
          timestamp: addSeconds(baseDate, 10).toISOString(),
          counter: 2,
          nodeId: "node2",
        }).get()
      ),
      mutate.update(
        {
          entity: "user",
          version: 1,
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          field: "first_name",
          value: "Jonathan",
        },
        new HLC({
          timestamp: addSeconds(baseDate, 5).toISOString(),
          counter: 2,
          nodeId: "node3",
        }).get()
      ),
      mutate.update(
        {
          entity: "user",
          version: 1,
          id: "f05800cb-7ddd-4e8c-8e17-b3b3941ed43c",
          field: "first_name",
          value: "Jon",
        },
        new HLC({
          timestamp: addSeconds(baseDate, 5).toISOString(),
          counter: 3,
          nodeId: "node4",
        }).get()
      ),
    ];

    expect(sortMessages(messages)).toStrictEqual([
      messages[0],
      messages[2],
      messages[3],
      messages[1],
    ]);
  });
});

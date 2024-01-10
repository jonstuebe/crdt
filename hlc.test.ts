import { HLC } from "./hlc";
import { describe, expect, it } from "vitest";

describe("HLC", () => {
  it("should initialize with default values", () => {
    const timestamp = new Date(2022, 0, 1, 12, 0, 0).toISOString();
    const hlc = new HLC({ nodeId: "node1", timestamp });

    expect(hlc.get()).toEqual(`2022-01-01T19:00:00.000Z-0000-node1`);
  });

  it("should update the timestamp and counter on change", () => {
    const timestamp = new Date(2022, 0, 1, 12, 0, 0).toISOString();
    const hlc = new HLC({ nodeId: "node1", timestamp });

    hlc.change("2022-01-02T00:00:00.000Z");

    expect(hlc.get()).toEqual(`2022-01-02T00:00:00.000Z-0001-node1`);

    hlc.change("2022-01-02T00:12:00.000Z");

    expect(hlc.get()).toEqual(`2022-01-02T00:12:00.000Z-0002-node1`);
  });

  it("should decode a timestamp string into an HLC object", () => {
    const timestamp = new Date(2022, 0, 1, 12, 0, 0).toISOString();
    const hlc = new HLC({ nodeId: "node1", timestamp });

    const decoded = HLC.decode(hlc.get());

    expect(decoded).toEqual(hlc);
  });
});

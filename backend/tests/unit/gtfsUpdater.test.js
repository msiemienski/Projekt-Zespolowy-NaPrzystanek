import { describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({
  default: vi.fn()
}));

import axios from "axios";
import { updateGTFS } from "../../src/utils/gtfsUpdater.js";

describe("updateGTFS", () => {
  it("rethrows error when download fails", async () => {
    axios.mockRejectedValueOnce(new Error("network down"));

    await expect(updateGTFS()).rejects.toThrow("network down");
  });
});

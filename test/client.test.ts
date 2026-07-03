import { describe, expect, it, vi } from "vitest";
import { OpenProjectClient } from "../src/client.js";
import { OpenProjectError } from "../src/errors.js";

function mockFetch(response: {
  ok: boolean;
  status?: number;
  statusText?: string;
  body?: unknown;
}) {
  return vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 500),
    statusText: response.statusText ?? (response.ok ? "OK" : "Error"),
    json: async () => response.body,
  });
}

describe("OpenProjectClient", () => {
  it("sends bearer auth by default", async () => {
    const fetchMock = mockFetch({
      ok: true,
      body: { _type: "User", id: 1, name: "Test", _links: { self: { href: "/api/v3/users/me" } } },
    });

    const client = new OpenProjectClient({
      baseUrl: "https://openproject.example.com",
      apiKey: "opapi-test-key",
      fetch: fetchMock,
    });

    await client.users.me();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      Authorization: "Bearer opapi-test-key",
      Accept: "application/hal+json",
    });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://openproject.example.com/api/v3/users/me",
    );
  });

  it("supports basic auth", async () => {
    const fetchMock = mockFetch({
      ok: true,
      body: { _type: "User", id: 1, name: "Test", _links: { self: { href: "/api/v3/users/me" } } },
    });

    const client = new OpenProjectClient({
      baseUrl: "https://openproject.example.com",
      apiKey: "opapi-test-key",
      auth: "basic",
      fetch: fetchMock,
    });

    await client.users.me();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const expected = `Basic ${Buffer.from("apikey:opapi-test-key").toString("base64")}`;
    expect((init.headers as Record<string, string>).Authorization).toBe(expected);
  });

  it("throws OpenProjectError on API failures", async () => {
    const fetchMock = mockFetch({
      ok: false,
      status: 404,
      statusText: "Not Found",
      body: {
        _type: "Error",
        errorIdentifier: "urn:openproject-org:api:v3:errors:NotFound",
        message: "The requested resource could not be found.",
      },
    });

    const client = new OpenProjectClient({
      baseUrl: "https://openproject.example.com",
      apiKey: "opapi-test-key",
      fetch: fetchMock,
    });

    await expect(client.projects.get(999)).rejects.toBeInstanceOf(OpenProjectError);
    await expect(client.projects.get(999)).rejects.toMatchObject({
      status: 404,
      message: "The requested resource could not be found.",
    });
  });

  it("creates work packages with HAL links", async () => {
    const fetchMock = mockFetch({
      ok: true,
      body: {
        _type: "WorkPackage",
        id: 42,
        subject: "New task",
        _links: { self: { href: "/api/v3/work_packages/42" } },
      },
    });

    const client = new OpenProjectClient({
      baseUrl: "https://openproject.example.com",
      apiKey: "opapi-test-key",
      fetch: fetchMock,
    });

    await client.workPackages.create({
      project: 1,
      subject: "New task",
      type: 2,
      assignee: 5,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      subject: "New task",
      _links: {
        project: { href: "/api/v3/projects/1" },
        type: { href: "/api/v3/types/2" },
        assignee: { href: "/api/v3/users/5" },
      },
    });
  });

  it("serializes list filters", async () => {
    const fetchMock = mockFetch({
      ok: true,
      body: {
        _type: "WorkPackageCollection",
        total: 0,
        count: 0,
        _embedded: { elements: [] },
        _links: { self: { href: "/api/v3/work_packages" } },
      },
    });

    const client = new OpenProjectClient({
      baseUrl: "https://openproject.example.com",
      apiKey: "opapi-test-key",
      fetch: fetchMock,
    });

    await client.workPackages.list({
      filters: [{ status: { operator: "=", values: ["1"] } }],
      pageSize: 25,
      offset: 1,
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("pageSize=25");
    expect(url).toContain("offset=1");
    expect(url).toContain(
      encodeURIComponent('[{"status":{"operator":"=","values":["1"]}}]'),
    );
  });
});
